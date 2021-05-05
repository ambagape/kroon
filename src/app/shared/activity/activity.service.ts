/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';

@Injectable()
export class ActivityService {

  private _isBusy = false;

  constructor() { }

  busy() {
    this._isBusy = true;
  }

  done() {
    this._isBusy = false;
  }

  get isBusy(): boolean {
    return this._isBusy;
  }

}
