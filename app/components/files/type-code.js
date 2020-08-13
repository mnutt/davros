import Component from '@glimmer/component';

const style =
  '<style>html { font-family: monospace; padding: 20px; white-space: pre-wrap; }</style>\n\n';

export default class TypeDocumentComponent extends Component {
  get canSandbox() {
    return 'sandbox' in document.createElement('iframe');
  }

  get errored() {
    return this.args.model.previewFailed;
  }

  get srcDoc() {
    return style + this.args.model.previewContent;
  }
}
