import Component from '@glimmer/component';
import showdown from 'showdown';

const markdownOptions = {
  completeHTMLDocument: false,
  openLinksInNewWindow: true,
  tables: true,
};

const style =
  '<style>html { font-family: sans-serif; padding: 20px; } pre { white-space: pre-wrap; }</style>\n\n';

export default class TypeMarkdownComponent extends Component {
  get canSandbox() {
    return 'sandbox' in document.createElement('iframe');
  }

  get errored() {
    return this.srcDoc === '';
  }

  get srcDoc() {
    if (this.args.model.previewFailed) {
      return '';
    }

    try {
      const converter = new showdown.Converter(markdownOptions);
      return style + converter.makeHtml(this.args.model.previewContent);
    } catch (e) {
      return '';
    }
  }
}
