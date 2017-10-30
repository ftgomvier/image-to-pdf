<template>
  <div id='UploadImage'>

    <input
      id='docUp'
      name='arquivo'
      type='file'
      accept='image/*'
      @change='onFileChange'
      multiple
    />

    <canvas ref='docCanvas' hidden></canvas>

  </div>
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
      }
    },
    data () {
      return {
        localHeight: 0,
        localWigth: 0,
        localQuality: 0
      }
    },
    created () {
      if (typeof this.maxHeight !== 'undefined') {
        this.localHeight = this.maxHeight
      }

      if (typeof this.maxWidth !== 'undefined') {
        this.localWigth = this.maxWidth
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
        }
        else {
          var imagesResized = []
          for (let file of files) {
            var MAX_WIDTH = this.localWigth > 0 ? this.localWigth : false
            var MAX_HEIGHT = this.localHeight > 0 ? this.localHeight : false
            var QUALITY_IMG = this.localQuality > 0 ? this.localQuality : 0.5

            var can = this.$refs.docCanvas
            can.style.visibility = 'hidden'

            var reader = new FileReader()
            reader.readAsDataURL(file)

            var imagem = new Image()
            reader.onabort = function () {
              console.log('The upload was aborted.')
            }
            reader.onerror = function () {
              console.log('An error occured while reading the file.')
            }
            reader.onload = (e) => {
              imagem.src = e.target.result

            }

            var blob
            var getBlob = function () {
              return new Promise(
                function (resolve, reject) {
                  imagem.onload = function () {
                    if (this.width === 0 || this.height === 0) {
                      console.log('Image is empty')
                    }
                    else {
                      MAX_WIDTH = MAX_WIDTH ? MAX_WIDTH : imagem.width
                      MAX_HEIGHT = MAX_HEIGHT ? MAX_HEIGHT : imagem.height

                      // Defining Canvas
                      can.width = MAX_WIDTH
                      can.height = MAX_HEIGHT

                      var ctx = can.getContext('2d')
                      ctx.clearRect(0, 0, MAX_WIDTH, MAX_HEIGHT)
                      ctx.drawImage(imagem, 0, 0, this.localWigth, this.localHeight, 0, 0, MAX_WIDTH, MAX_HEIGHT)

                      let canvasUrl = can.toDataURL('image/jpeg', QUALITY_IMG)

                      let BASE64_MARKER = 'base64,'
                      let base64Index = canvasUrl.indexOf(BASE64_MARKER) + BASE64_MARKER.length
                      let base64 = canvasUrl.substring(base64Index)

                      let data = canvasUrl.split(',')[1]
                      let mimeType = canvasUrl.split(',')[0].split(':')[1].split(';')[0]
                      blob = this.convert(data, mimeType, 1)

                      resolve([blob, base64])
                    }
                  }
                }
              )
            }

            getBlob(can).then((blob) => {
              let img = {
                blob: blob[0],
                base64: blob[1]
              }

              this.$emit('resizedImage', img)
            })
          }
        }
      }
    },
    convert (b64Data, contentType, sliceSize) {
      contentType = contentType || ''
      sliceSize = sliceSize || 512
      var byteCharacters = atob(b64Data)
      var byteArrays = []
      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize)
        var byteNumbers = new Array(slice.length)
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }
        var byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
      }
      var blob = new Blob(byteArrays, { type: contentType })
      return blob
    }
  }
</script>
