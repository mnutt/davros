import Component from '@glimmer/component';

const base = '/api/thumbnail?';

const dpi = window.devicePixelRatio || 1;

export default class ImageThumbnailComponent extends Component {
  get cacheBuster() {
    let timestamp = this.args.timestamp;
    if (timestamp.getTime) {
      return timestamp.getTime();
    } else {
      return timestamp.toString();
    }
  }

  get src() {
    const params = new URLSearchParams({
      url: this.args.original,
      width: Math.floor(this.args.width * dpi),
      height: Math.floor(this.args.height * dpi),
      op: this.args.op || 'fit',
      ts: this.cachebuster
    });

    return base + params.toString();
  }
}
