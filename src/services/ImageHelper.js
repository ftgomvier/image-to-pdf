/*
 * @param {string} sourceId is the div's id used to generate the canvas that will be used to resize the images.
 * @return {string} return a canvas.id to refer the canvas created
 */
function createCanvas (sourceId) {
  let canvasDiv = document.getElementById(sourceId)
  let canvas = document.createElement('canvas')
  canvas.id = Math.random()
    .toString(36)
    .slice(2)
  // canvas.style.visibility = 'hidden'
  canvasDiv.appendChild(canvas)
  return canvas.id
}

async function _resizeImage (imgSrc, { canvasId, maxWidth, maxHeight, maxQuality }) {
  // Create canvas
  let id = createCanvas(canvasId)
  let can = document.getElementById(id)

  // Set canvas local configurations
  let MAX_WIDTH = maxWidth > 0 ? maxWidth : 0
  let MAX_HEIGHT = maxHeight > 0 ? maxHeight : 0
  let QUALITY_IMG = maxQuality > 0 ? maxQuality / 100 : 0.8
  let imageObj = new Image()
  imageObj.src = imgSrc
  let getBlob = function () {
    return new Promise((resolve) => {
      imageObj.onload = function () {
        if (this.width === 0 || this.height === 0) {
          console.log('Image is empty')
        } else {
          // Defining Canvas
          let scaleWidth = MAX_WIDTH
          let scaleHeight = (
            (
              MAX_WIDTH * this.height
            ) / this.width
          )
          can.width = scaleWidth
          can.height = scaleHeight
          let ctx = can.getContext('2d')
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
          let byteCharacters = atob(data)
          let byteArrays = []
          for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize)
            let byteNumbers = new Array(slice.length)
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i)
            }
            let byteArray = new Uint8Array(byteNumbers)
            byteArrays.push(byteArray)
          }
          let blob = new Blob(byteArrays, { type: mimeType })
          resolve([
            {
              blob,
              base64,
              canvasUrl,
              scale: {
                width: scaleWidth,
                height: scaleHeight
              }
            }
          ])
        }
      }
    })
  }
  let blob = await getBlob()
  return blob[0]
}

async function _onFileChange (e, { canvasId, maxWidth, maxHeight, maxQuality }) {
  console.log('_onfile', e.target.files)
  let files = e.target.files || e.dataTransfer.files
  if (files.length <= 0) {
    return false
  } else {
    let blobs = []
    for (let file of files) {
      document.getElementById('canvasPlace').innerHTML = ''
      let reader = new FileReader()
      reader.onabort = function () { console.log('The upload was aborted.') }
      reader.onerror = function () { console.log('An error occured while reading the file.') }
      let getBlob = function () {
        return new Promise((resolve) => {
          reader.onload = async (e) => {
            let response = await resizeImage(e.target.result, {
              canvasId,
              maxWidth,
              maxHeight,
              maxQuality
            })
            console.log('onload', response)
            resolve(response)
          }
          reader.readAsDataURL(file)
        })
      }
      try {
        let blob = await getBlob()
        blobs.push(blob)
      } catch (err) {
        console.log('Error when get blob from file', err)
      }
      return blobs
    }
  }
}

function onFileChange (e, { canvasId, maxWidth, maxHeight, maxQuality }) {
  return new Promise((resolve, reject) => {
    _onFileChange(e, { canvasId, maxWidth, maxHeight, maxQuality })
      .then(res => {
        resolve(res)
      }).catch((err) => reject(err))
  })
}

function resizeImage (imgSrc, { canvasId, maxWidth, maxHeight, maxQuality }) {
  return new Promise((resolve, reject) => {
    _resizeImage(imgSrc, {
      canvasId,
      maxWidth,
      maxHeight,
      maxQuality
    })
      .then(res => resolve(res))
      .catch(err => reject(err))
  })
}

export {
  resizeImage,
  onFileChange
}
