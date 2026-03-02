import Component from '@glimmer/component';
import showdown from 'showdown';
import { htmlSafe } from '@ember/template';

const markdownOptions = {
  completeHTMLDocument: false,
  openLinksInNewWindow: true,
  tables: true,
};

const converter = new showdown.Converter(markdownOptions);

export default class MarkdownToHtmlComponent extends Component {
  get renderedMarkdown() {
    const markdown = this.args.markdown ?? '';

    try {
      return htmlSafe(converter.makeHtml(markdown));
    } catch (_error) {
      return '';
    }
  }
}
