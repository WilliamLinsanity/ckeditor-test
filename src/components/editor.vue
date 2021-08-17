<template>
  <ckeditor :editor="editor" :value="editorData" :config="editorConfig">
    <title>
    <title-content>
        Feasibility Study
    </title-content>
</title>
  </ckeditor>
</template>

<script>
  // import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
  import ClassicEditor from './ckeditor5-build-classic/src/ckeditor'
  import CKEditor from '@ckeditor/ckeditor5-vue'
  export default {
    name: 'inEditor',
    props: {
      value: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: '請輸入內容'
      },
       title: {
        type: String,
        default: '請輸入標題'
      }
    },
    data () {
      return {
        //獲取編譯器實例
        editor: ClassicEditor,
        editorData: '',
        editorConfig: {
          placeholder: this.placeholder,
          title:this.title,
           heading: {
              options: [
                 { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                  { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                  { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                  { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                  {
                    model: 'headingFancy',
                    view: {
                        name: 'h2',
                        classes: 'fancy'
                    },
                    title: 'Heading 2 (fancy)',
                    class: 'ck-heading_heading2_fancy',

                    // It needs to be converted before the standard 'heading2'.
                    converterPriority: 'high'
                }
              ]
            }
        }
      }
    },
    watch: {
      'value' (val) {
        if (!this.editor) {
          return
        }
        
        if (val && val !== this.editorData) {
          this.editorData = this.value
        }
      },
      'editorData' (val) {
        if (val && val !== this.value) {
          this.$emit('input', val)
        }
      }
    },
    created() {
      this.editorData = this.value
    },
    components: {
      ckeditor: CKEditor.component
    }
  }
</script>

<style lang="scss">
@import "../assets/css/content";
.ck-editor__editable_inline {
    min-height: 400px;
}
</style>