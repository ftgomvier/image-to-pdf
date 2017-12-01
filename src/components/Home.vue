<template lang="pug">
  .Home
    .container
      .left-sidebar
        .logo
          a(href="https://github.com/fthiagogv/ImageToPdf", target="_blank")
            img(src="http://www.freepngimg.com/download/github/1-2-github-free-png-image.png",
            width="50px",
            height="50px"
            )
        div(style="margin-left: 10px;")
          small v1.0
        .m-30
          h2 Image settings
          .line-container.line-border
            .item-line-container-left
              label  Quality of the images (%):
            .item-line-container-right
              input(
                v-model="quality",
                type="number",
                placeholder="Set the quality of the image",
                max="100",
                min="30"
              )

        .m-30
          h2 PDF settings
          p
            .line-container(style="margin: 50px 0px 50px 0px;")
              p Quick settings:
              a.button(@click="changeQuality('lowest')") Lowest
              a.button(@click="changeQuality('low')") Low
              a.button(@click="changeQuality('medium')") Medium
              a.button(@click="changeQuality('high')") High
          p
            .line-container.line-border
              .item-line-container-left
                label  How many images in the same page?
              .item-line-container-right
                input(
                  @change="cleanImages()",
                  v-model="pdfImgOnPage",
                  type="number",
                  placeholder="Set the max Width"
                  min=1
                  max=10
                )
          p
            .line-container.line-border
              .item-line-container-left
                label  Width margin (cm):
              .item-line-container-right
                input(
                  @change="cleanImages()",
                  v-model="marginWidth",
                  type="number",
                  placeholder="Set the max Width"
                  min=0
                  max=5
                )
          p
            .line-container.line-border
              .item-line-container-left
                label  Height margin (cm):
              .item-line-container-right
                input(
                  @change="cleanImages()",
                  v-model="marginHeight",
                  type="number",
                  placeholder="Set the max Width"
                  min=0
                  max=5
                )
          p
            .line-container.line-border
              .item-line-container-left
                label  What is the page orientation?
              .item-line-container-right
                select(name="pdfOrientation", v-model="pdfOrientation" @change="resolutions")
                  option(value="portrait") Portrait
                  option(value="landscape") Landscape

          p
            .line-container.line-border
              .item-line-container-left
                label Quality resolution of the paper?
              .item-line-container-right
                select(name="pdfQuality", v-model="pdfQuality" @change="resolutions")
                  option(value="low") Low
                  option(value="medium") Medium
                  option(value="high") High
          p
            .line-container.line-border
              .item-line-container-left
                label How many ppi?
              .item-line-container-right
                select(name="pdfPPi", v-model="pdfPPi" @change="resolutions")
                  option(v-for="(ppi, index) in ppiOptions", :key="index", :value="ppi") {{ ppi }} PPI

        .m-30
          .upload-field
            h2 Upload images
            UploadImage(
              style="margin-left: 0 auto;"
              @click="clearButtonUp"
              :maxHeight="pxImgHeight",
              :maxWidth="pxImgWidth",
              :maxQuality="quality",
              @resizedImage="resizedImage"
            )

            div(v-if="imagesResized.length > 0" style="margin: 30px 0px 0px 0px;")
              button(@click="cleanImages") Clear images' set

      .body-side
        .m-30
          h3 PDF settings:
          p Page A4, {{ pdfOrientation | capitalize }}, {{ maxWidth }} x {{ maxHeight }},
            |  margins: {{ marginWidth }}cm (~{{ pxMarginWidth }}px) x {{ marginHeight }}cm (~{{ pxMarginHeight }}px),
            | {{ pdfImgOnPage }} images in each page

        .m-30(v-if="pdfMade")
          button(
            @click='downloadPdf',
          ) Download PDF

        div(v-for="(img, index) in imagesResized", :key='index' style="max-width: 25%; float: left; margin-left: 5%;")
          img(
            :id="getId(index)"
            :src='getSrc(img)',
            style="max-width: 100%;"
          )

</template>

<script>
import JsPdf from 'jspdf'
import UploadImage from './UploadImage'
import ShowImages from './ShowImages'

export default {
  name: 'Home',
  components: {
    UploadImage,
    ShowImages
  },
  data () {
    return {
      pdfMade: false,
      pdfImgOnPage: 1,
      pdfOrientation: 'portrait',
      pdfQuality: 'low',
      pdfPPi: '72',
      marginWidth: 0,
      marginHeight: 0,
      quality: 90,
      maxWidth: 0,
      maxHeight: 0,
      imagesResized: []
    }
  },
  create () {
    this.imagesResized = []
    this.resolutions()
  },
  mounted () {
    this.imagesResized = []
    this.resolutions()
  },
  methods: {
    clearButtonUp () {
      this.pdfMade = false
      document.getElementById('docUp').value = ''
    },
    cleanImages () {
      this.pdfMade = false
      this.imagesResized = []
      this.clearButtonUp()
    },
    resizedImage (img) {
      if (typeof img !== 'undefined') {
        this.imagesResized.push(img)
        this.pdfMade = true
      }
    },
    getSrc (img) {
      if (typeof img.base64 !== 'undefined') {
        return 'data:image/png;base64,' + img.base64
      }

      return ''
    },
    downloadPdf () {
      let pdf = new JsPdf(this.pdfOrientation[0], 'pt', [this.maxWidth * 0.75, this.maxHeight * 0.75])
      let counter = 0
      let iterator = 0
      var hMargin = this.ptMarginHeight
      var wMargin = this.ptMarginWidth
      var fitSize = 0
      while (iterator < this.imagesResized.length) {
        counter += 1

        let isPortrait = this.pdfOrientation === 'portrait'
        let image = this.imagesResized[iterator]

        if (typeof image === 'undefined') {
          return
        }

        if (this.pdfImgOnPage > 1 && iterator % this.pdfImgOnPage === 0) {
          fitSize = isPortrait ? (this.maxHeight * 0.75) / this.pdfImgOnPage : (this.maxWidth * 0.75) / this.pdfImgOnPage
        }

        var wScale = image.scale[0] * 0.75
        var hScale = image.scale[1] * 0.75

        // Resize with new Scale
        if (isPortrait && fitSize > 0) {
          let oldScale = hScale
          hScale = fitSize
          wScale = (wScale * hScale) / oldScale
        } else if (!isPortrait && fitSize > 0) {
          let oldScale = wScale
          wScale = fitSize
          hScale = (hScale * wScale) / oldScale
        }

        console.log(iterator, fitSize, image, hScale, wScale, hMargin, wMargin)

        pdf.addImage(image.canvasUrl, 'jpeg', wMargin, hMargin, wScale, hScale)
        if (counter >= parseInt(this.pdfImgOnPage) && iterator < (this.imagesResized.length - 1)) {
          fitSize = 0
          counter = 0
          hMargin = this.ptMarginHeight
          wMargin = this.ptMarginWidth
          pdf.addPage()
        } else {
          if (isPortrait) {
            hMargin += hScale + this.ptMarginHeight
          } else {
            wMargin += wScale + this.ptMarginWidth
          }
        }

        iterator += 1
      }

      pdf.save()
    },
    resolutions () {
      this.$nextTick(() => {
        let resolutions = {
          '72': {'width': 595, 'height': 842},
          '96': {'width': 794, 'height': 1123},
          '150': {'width': 1240, 'height': 1754},
          '300': {'width': 2480, 'height': 3508},
          '600': {'width': 4960, 'height': 7016},
          '720': {'width': 5953, 'height': 8419},
          '1200': {'width': 9921, 'height': 14032},
          '1440': {'width': 11906, 'height': 16838},
          '2400': {'width': 19843, 'height': 28063},
          '2880': {'width': 23811, 'height': 33676}
        }

        this.maxHeight = resolutions[this.pdfPPi].height
        this.maxWidth = resolutions[this.pdfPPi].width

        this.cleanImages()
      })
    },
    getAvarageScale (index) {
      let slice = this.imagesResized.slice(index, index + this.pdfImgOnPage)

      // Verify if images fit on page "naturally"
      let imagesFitOnPage = 0
      for (let s of slice) {
        imagesFitOnPage += this.pdfOrientation === 'portrait' ? s.scale[1] : s.scale[0]
      }

      if (imagesFitOnPage <= this.maxHeight) {
        return 0
      } else {
        let spareSize = imagesFitOnPage - this.maxHeight
        return spareSize / this.pdfImgOnPage
      }
    },
    changeQuality (quality) {
      switch (quality) {
        case 'lowest':
          this.pdfPPi = '72'
          this.pdfQuality = 'low'
          break

        case 'low':
          this.pdfPPi = '300'
          this.pdfQuality = 'low'
          break

        case 'medium':
          this.pdfQuality = 'medium'
          this.pdfPPi = '600'
          break

        case 'high':
          this.pdfQuality = 'high'
          this.pdfPPi = '1440'
          break

        default:
          break
      }
      this.resolutions()
    },
    getId (index) {
      return 'image-' + index
    }
  },
  computed: {
    ppiOptions: function () {
      let ppi = {
        'low': ['72', '96', '150', '300'],
        'medium': ['600', '720', '1200'],
        'high': ['1440', '2400', '2880']
      }

      this.pdfPPi = ppi[this.pdfQuality][0]

      return ppi[this.pdfQuality]
    },
    pxMarginHeight: function () {
      let pxCm = 38

      return this.marginHeight * pxCm
    },
    pxMarginWidth: function () {
      let pxCm = 38

      return this.marginWidth * pxCm
    },
    ptMarginWidth: function () {
      return this.pxMarginWidth * 0.75
    },
    ptMarginHeight: function () {
      return this.pxMarginHeight * 0.75
    },
    pxImgWidth: function () {
      let reduceMargin = this.pdfOrientation === 'landscape' ? this.pxMarginHeight * 4 : this.pxMarginHeight * 2
      let size = this.maxWidth - reduceMargin
      size = this.pdfOrientation === 'portrait' ? size : size / this.pdfImgOnPage
      return parseInt(size)
    },
    pxImgHeight: function () {
      let reduceMargin = this.pdfOrientation === 'portrait' ? this.pxMarginHeight * 4 : this.pxMarginHeight * 2
      let size = this.maxHeight - reduceMargin
      size = this.pdfOrientation === 'portrait' ? size / this.pdfImgOnPage : size
      return parseInt(size)
    },
    ptImgWidth: function () {
      return parseInt(this.pxImgWidth * 0.75)
    },
    ptImgHeigth: function () {
      return parseInt(this.pxImgHeight * 0.75)
    }
  },
  filters: {
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
}
</script>

<style scoped>

.m-30 {
  margin: 30px;
}

.container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: stretch;
  align-content: stretch;
  height: 100vh;
}

.line-container.line-border {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.line-border {
  border-bottom: 1px solid hsl(180, 30%, 40%);
  border-left: 1px solid hsl(180, 30%, 40%);
  border-bottom-left-radius: 5px;
  padding-bottom: 10px;
  padding-left: 10px;
}

.item-line-container-left {
  align-self: center;
}
.item-line-container-right {
  align-self: center;
}

.left-sidebar h2 {
  text-align: center;
}

.left-sidebar input, select {
  width: 100px;
  margin-left: 30px;
}

.left-sidebar {
  order: 1;
  background-color: hsl(180, 10%, 30%);
  color: hsl(180, 30%, 90%);
}
.body-side {
  order: 2;
  width: 50%;
}

.upload-field {
  text-align: center;
  background-color: hsla(180, 20%, 50%, 0.2);
  border: 1px hsl(180, 30%, 40%) solid;
  border-radius: 20px;
  padding-bottom: 30px;
  /* padding-left: 30px; */
}

.button {
  background-color: hsla(180, 20%, 50%, 0.2);
  border: 1px hsl(180, 30%, 40%) solid;
  border-radius: 2px;
  padding: 8px 25px 8px 25px;
  margin: 5px;
}

.logo {
  right: 0;
  top: 0;
  position: fixed;
}
</style>

