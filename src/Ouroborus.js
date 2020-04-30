/*
 * Copyright 2020 Phara0h
 * Changes are the diff from uWebSockets.js v17.4.0 (commit 116a85f9668dcb03e7799db06dc8275bc43c0963)
 * to this file.
 *
 * Authored by Alex Hultman, 2018-2019.
 * Intellectual property of third-party.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Interface = require('./js/Interface.js')
module.exports = ((config = {server:{}}) => {
  try {
    const Ouroborus = require('./Ouroborus_' + process.platform + '_' + process.arch + '_' + process.versions.modules + '.node');
    if (process.env.EXPERIMENTAL_FASTCALL) {
      process.nextTick = (f, ...args) => {
        Promise.resolve().then(() => {
          f(...args);
        });
      };
    }
    process.on('exit', Ouroborus.free);

    return new Interface(Ouroborus.App());
  } catch (e) {
    throw new Error('This version of Ouroborus is not compatible with your Node.js build:\n\n' + e.toString());
  }
});
