import Component from '@glimmer/component';

// Attempt to work around LibreOffice .doc bullet rendering issues
const bullet = new RegExp(/[\uF077\uF0B7\uF024\uF0A7]+/, 'g');

export default class TypeDocumentComponent extends Component {
  get canSandbox() {
    return 'sandbox' in document.createElement('iframe');
  }

  get errored() {
    console.log(this.args.model);
    return this.args.model.previewFailed;
  }

  get srcDoc() {
    return this.args.model.previewContent.replace(bullet, '&bullet;');
  }
}
