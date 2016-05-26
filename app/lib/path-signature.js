import ajax from 'ic-ajax';

export default function(path) {
  let encodedPath = path.replace(/\s/g, '%20');
  return ajax('/api/signature', {data: {path: encodedPath}}).then((response) => {
    response = JSON.parse(response);
    return `${path}?signature=${response.signature}`;
  });
}
