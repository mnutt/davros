import { helper as buildHelper } from '@ember/component/helper';

const eq = (params) => params[0] === params[1];
export default buildHelper(eq);
