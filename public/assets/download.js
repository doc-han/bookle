const homedir = require('os').homedir
const url = require('url')
const { http } = require('follow-redirects')

class Download {
  constructor (link, filename, uid, dlOb) {
    this.link = link
    this.filename = filename
    this.uid = `dn${uid}`
    this.filepath = `${homedir}/Downloads/${filename}`
    this.dl = dlOb.download(link, this.filepath)
  }

  startDownload () {
    let options = {
      threadCount: 5
    }

    this.dl.setRetryOptions({
      retryInterval: 10000
    })

      http.get(this.link, (response) => {
        this.dl.url = response.responseUrl
        this.dl.setOptions(options)
        this.dl.start()
        this.anodaStartDownload()
      }).on('error', function (err) {
        console.error(err)
      })
    
  }

  anodaStartDownload () {
    console.log(this.dl)
    this.injectCode()
    // $(`#${this.uid} .dl-title`).text(this.filename)
    // $(`#${this.uid} .progress`).progress({ percent: 0 })
    var notStarted = 0
    var retryAgain = 0
    var resume = 0
    var timer = setInterval(() => {
      switch (this.dl.status) {
        case 0:
          if (retryAgain <= 5) {
            notStarted++
            if (notStarted >= 15) {
              this.dl.start()
              notStarted = 0
              retryAgain++
            }
          }
          break
        case 1:
          let stats = this.dl.getStats()
          let compl = stats.total.completed || 0
          let speed = (parseInt(stats.present.speed / 1024) || 0) + ' Kb/s'
        //   $(`#${this.uid} .dl-speed`).text(speed)
           $(`#${this.uid} .d-pro`).text(`${compl}%`)
        //   $(`#${this.uid} .progress .label`).text(`${compl}%`)
          break
        case 2:
          break
        case -1:
            if(resume<=100){
                this.dl.resume();
                resume++;
            }else{
                $(`#${this.uid} .d-pro`).text("error")
          clearInterval(timer)
            }
          break
        default:
      }
    }, 1000)
    this.dl.on('start', () => {
      console.log(this.dl)
      console.log(' dl started!!!')
    })
    this.dl.on('stopped', () => {
      console.log(' stopped!!!')
    })
    this.dl.on('end', () => {
        $(`#${this.uid} .d-pro`).text("done")
      console.log('download complete')
    })
    this.dl.on('error', () => {
      console.log(this.dl)
      console.log('error downloading ')
    })
  }

  injectCode () {
    let code = `<tr id="${this.uid}">
        <td>${this.filename}</td>
        <td class="d-pro"></td>
    </tr>`
    $('tbody').prepend(code)
  }
}

module.exports = Download