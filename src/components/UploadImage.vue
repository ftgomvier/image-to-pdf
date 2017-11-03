<template lang="pug">
  .UploadImage
    input#docUp(
      name="arquivo",
      type="file",
      accept="image/*",
      @change="onFileChange",
      multiple
    )
    #canvasPlace(hidden)

</template>

<script>
  export default {
    name: 'UploadImage',
    props: {
      maxHeight: {
        type: Number
      },
      maxWidth: {
        type: Number
      },
      maxQuality: {
        type: Number
      },
      imageByPage: {
        type: Number,
        default: 1
      },
      pageOrientation: {
        type: String,
        default: 'portrait'
      }
    },
    watch: {
      maxHeight () {
        if (typeof this.maxHeight !== 'undefined') {
          this.localHeight = this.maxHeight
        }
      },
      maxWidth () {
        if (typeof this.maxWidth !== 'undefined') {
          this.localWidth = this.maxWidth
        }
      },
      maxQuality () {
        if (typeof this.maxQuality !== 'undefined') {
          this.localQuality = this.maxQuality
        }
      }
    },
    data () {
      return {
        localHeight: 0,
        localWidth: 0,
        localQuality: 0
      }
    },
    created () {
      if (typeof this.maxHeight !== 'undefined') {
        this.localHeight = this.maxHeight
      }

      if (typeof this.maxWidth !== 'undefined') {
        this.localWidth = this.maxWidth
      }

      if (typeof this.maxQuality !== 'undefined') {
        this.localQuality = this.maxQuality
      }
    },
    methods: {
      onFileChange (e) {
        var files = e.target.files || e.dataTransfer.files

        if (files.length <= 0) {
          this.$emit('resizedImage', false)
        } else {
          for (let file of files) {
            document.getElementById('canvasPlace').innerHTML = ''

            var reader = new FileReader()
            reader.onabort = function () {
              console.log('The upload was aborted.')
            }
            reader.onerror = function () {
              console.log('An error occured while reading the file.')
            }

            reader.onload = (e) => {
              this.createCanvas()
              // Create canvas
              let id = this.createCanvas()
              var can = document.getElementById(id)

              var MAX_WIDTH = this.localWidth > 0 ? this.localWidth : 0
              var MAX_HEIGHT = this.localHeight > 0 ? this.localHeight : 0
              var QUALITY_IMG = this.localQuality > 0 ? this.localQuality / 100 : 0.5

              var imageObj = new Image()
              imageObj.src = e.target.result

              var getBlob = function () {
                return new Promise(
                  function (resolve, reject) {
                    imageObj.onload = function () {
                      if (this.width === 0 || this.height === 0) {
                        console.log('Image is empty')
                      } else {
                        // Defining Canvas
                        let scaleWidth = MAX_WIDTH
                        let scaleHeight = ((MAX_WIDTH * this.height) / this.width)

                        can.width = scaleWidth
                        can.height = scaleHeight

                        var ctx = can.getContext('2d')
                        ctx.clearRect(0, 0, MAX_WIDTH, MAX_HEIGHT)
                        ctx.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, scaleWidth, scaleHeight)

                        let canvasUrl = can.toDataURL('image/jpeg', QUALITY_IMG)

                        let BASE64_MARKER = 'base64,'
                        let base64Index = canvasUrl.indexOf(BASE64_MARKER) + BASE64_MARKER.length
                        let base64 = canvasUrl.substring(base64Index)

                        let data = canvasUrl.split(',')[1]
                        let mimeType = canvasUrl.split(',')[0].split(':')[1].split(';')[0]

                        // CONVERTING TO BLOB
                        let sliceSize = 512
                        var byteCharacters = atob(data)
                        var byteArrays = []
                        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                          var slice = byteCharacters.slice(offset, offset + sliceSize)
                          var byteNumbers = new Array(slice.length)
                          for (let i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i)
                          }
                          let byteArray = new Uint8Array(byteNumbers)
                          byteArrays.push(byteArray)
                        }

                        let blob = new Blob(byteArrays, { type: mimeType })

                        resolve([blob, base64, canvasUrl, scaleWidth, scaleHeight])
                      }
                    }
                  }
                )
              }

              getBlob(can).then((blob) => {
                let img = {
                  blob: blob[0],
                  base64: blob[1],
                  canvasUrl: blob[2],
                  scale: [blob[3], blob[4]]
                }

                this.$emit('resizedImage', img)
              })
            }

            reader.readAsDataURL(file)
          }
        }
      },
      createCanvas () {
        let canvasDiv = document.getElementById('canvasPlace')
        let canvas = document.createElement('canvas')
        canvas.id = Math.random().toString(36).slice(2)
        canvas.style.visibility = 'hidden'
        canvasDiv.appendChild(canvas)

        return canvas.id
      }
    }

  }
</script>
