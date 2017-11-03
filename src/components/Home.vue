<template lang="pug">
  .Home
    .m-30
      h2 Image configurations:
      label  Quality of the images (%):
      input(
        v-model="quality",
        type="number",
        placeholder="Set the quality of the image",
        max="100",
        min="30"
      )

    .m-30
      h2 PDF configuration
      label  How many images in the same page?
      input(
        v-model="pdfImgOnPage",
        type="number",
        placeholder="Set the max Width"
        min=1
        max=10
      )
      br
      label  Width margin (cm):
      input(
        v-model="marginWidth",
        type="number",
        placeholder="Set the max Width"
        min=0
        max=5
      )
      label  Height margin (cm):
      input(
        v-model="marginHeight",
        type="number",
        placeholder="Set the max Width"
        min=0
        max=5
      )
      br
      label  What is the page orientation?
      select(name="pdfOrientation", v-model="pdfOrientation" @change="resolutions")
        option(value="portrait") Portrait
        option(value="landscape") Landscape
      br
      label What is the quality resolution of the paper?
      select(name="pdfQuality", v-model="pdfQuality" @change="resolutions")
        option(value="low") Low
        option(value="medium") Medium
        option(value="high") High
      br
      label How many ppi?
      select(name="pdfPPi", v-model="pdfPPi" @change="resolutions")
        option(v-for="(ppi, index) in ppiOptions", :key="index", :value="ppi") {{ ppi }} PPI

    .m-30
      UploadImage(
        :maxHeight="pxImgHeight",
        :maxWidth="pxImgWidth",
        :maxQuality="quality",
        @resizedImage="resizedImage"
        @cleanImages="cleanImages"
      )

    .m-30
      h3 PDF settings:
      p Page A4, {{ pdfOrientation | capitalize }}, {{ maxWidth }} x {{ maxHeight }},
        |  margins: {{ marginWidth }}cm (~{{ pxMarginWidth }}px) x {{ marginHeight }}cm (~{{ pxMarginHeight }}px),
        | {{ pdfImgOnPage }} images in each page

    .m-30
      button(
        @click='downloadPdf',
      ) Download PDF

    div(v-for="(img, index) in imagesResized", :key='index' style="max-width: 25%; float: left; margin-left: 5%;")
      img(
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
      pdfImgOnPage: 1,
      pdfOrientation: 'portrait',
      pdfQuality: 'low',
      pdfPPi: '300',
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
    cleanImages () {
      this.imagesResized = []
    },
    resizedImage (img) {
      this.imagesResized.push(img)
      console.log('imagesResized', this.imagesResized)
    },
    getSrc (img) {
      console.log(img)
      return 'data:image/png;base64,' + img.base64
    },
    downloadPdf () {
      let pdf = new JsPdf(this.pdfOrientation[0], 'pt', [this.maxWidth, this.maxHeight])
      let counter = 0
      let iteration = 0
      for (let image of this.imagesResized) {
        counter++
        iteration++
        pdf.addImage(image.canvasUrl, 'jpeg', this.ptMarginWidth, this.ptMarginHeight, image.scale[0], image.scale[1])
        if (counter === this.pdfImgOnPage && iteration < this.imagesResized.length) {
          counter = 0
          pdf.addPage()
        }
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
      })
    }
  },
  computed: {
    ppiOptions: function () {
      let ppi = {
        'low': ['72', '96', '150', '300'],
        'medium': ['600', '720', '1200'],
        'high': ['1440', '2400', '2880']
      }

      this.pdfPPi = ppi[this.pdfQuality][ppi[this.pdfQuality].length - 1]

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
      return parseInt(((this.maxWidth - (this.pxMarginWidth * 2)) / this.pdfImgOnPage))
    },
    pxImgHeight: function () {
      return parseInt(((this.maxHeight - (this.pxMarginHeight * 2)) / this.pdfImgOnPage))
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
label {
  margin-right: 10px;
  margin-left: 30px;
}
</style>

