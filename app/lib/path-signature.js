import ajax from 'ic-ajax';

export default function(path) {
  return ajax('/api/signature').then((response) => {
    response = JSON.parse(response);
    return `${path}?signature=${response.signature}`;
  });
}
