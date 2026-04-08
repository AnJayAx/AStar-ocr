import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { data as sampleDataForGrid } from './sampleDataForGrid';
import {Observable} from 'rxjs';

@Injectable()
export class MocksService {
  constructor(private http: HttpClient) {}

  getPosts(): Observable<any> {
    return this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts');
  }
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class MocksLocalService {
  constructor() {}

  getSampleDataForGrid(): any {
    return sampleDataForGrid;
  }

  // json-server alternative
}
