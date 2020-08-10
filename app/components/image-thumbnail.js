import Component from '@glimmer/component';

const base = '/api/thumbnail?';

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
      width: this.args.width,
      height: this.args.height,
      op: this.args.op || 'fit',
      ts: this.cachebuster
    });

    return base + params.toString();
  }
}
