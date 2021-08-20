import Component from '@glimmer/component';

export default class PathBreadcrumbComponent extends Component {
  get parts() {
    const pieces = (this.args.path || '').split('/');
    let p = [];

    if (pieces.join('') === '') {
      return [];
    }

    // is a directory
    if (pieces[pieces.length - 1] === '') {
      pieces.pop();
    }

    for (let i = 0; i < pieces.length - 1; i++) {
      let path = pieces.slice(0, i + 1).join('/');

      if (i !== pieces.length - 1) {
        path += '/';
      }

      const part = {
        name: decodeURIComponent(pieces[i]),
        path: path
      };

      p.push(part);
    }

    return p;
  }

  get isHome() {
    return this.args.path === '/';
  }

  get parentPath() {
    const lastPart = this.parts[this.parts.length - 1];
    return (lastPart && lastPart.path) || '';
  }
}
