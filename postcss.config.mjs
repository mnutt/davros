import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [postcssImport(), tailwindcss('./config/tailwind.js'), autoprefixer()],
};
