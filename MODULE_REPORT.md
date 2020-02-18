## Module Report
### Unknown Global

**Global**: `Ember.inject`

**Location**: `app/controllers/file.js` at line 4

```js
import GalleryPlugin from '../mixins/directory/gallery';

const { get, computed, inject } = Ember;

export default Ember.Controller.extend(GalleryPlugin, {
```

### Unknown Global

**Global**: `Ember.inject`

**Location**: `app/controllers/publishing.js` at line 3

```js
import Ember from 'ember';

const { get, computed, inject } = Ember;

export default Ember.Controller.extend({
```

### Unknown Global

**Global**: `Ember.inject`

**Location**: `app/routes/file.js` at line 8

```js
import { task } from 'ember-concurrency';

const { get, inject } = Ember;

const socketUrl = ((document.location.protocol === 'https:') ? 'wss://' : 'ws://') + document.location.host;
```

### Unknown Global

**Global**: `Ember.inject`

**Location**: `app/routes/publishing.js` at line 4

```js
import fetch from 'ember-network/fetch';

const { get, inject } = Ember;

export default Ember.Route.extend({
```
