<template lang="pug">
  .UploadImage
    input#docUp(
    name="arquivo",
    type="file",
    accept="image/*",
    @change="changingFile",
    multiple
    )
    #canvasPlace(hidden)

</template>

<script>
  import { onFileChange } from '../services/ImageHelper'

  export default {
    name: 'UploadImage',
    props: {
      maxHeight: { type: Number },
      maxWidth: { type: Number },
      maxQuality: { type: Number },
      imageByPage: { type: Number, default: 1 },
      pageOrientation: { type: String, default: 'portrait' }
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
    methods: {
      changingFile (e) {
        onFileChange(
          e,
          { canvasId: 'canvasPlace', maxWidth: this.maxWidth, maxHeight: this.maxHeight, maxQuality: this.maxQuality }
        ).then(res => {
          for (let i of res) {
            this.$emit('resizedImage', i)
          }
        })
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
    }

  }
</script>
