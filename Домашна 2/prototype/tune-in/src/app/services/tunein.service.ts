import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  CountryModel,
  MoodModel,
  OutputPlaylistModel,
  WeatherModel,
} from '../models/tuneIn.model';

@Injectable()
export class TuneInService {
  private apiUrl = 'http://localhost:8080/';

  link: string;
  name: string;

  constructor(private http: HttpClient) {}

  getPlaylistForCountry(input: CountryModel): Observable<OutputPlaylistModel> {
    return this.http.post<OutputPlaylistModel>(this.apiUrl + 'country', input);
  }

  getPlaylistForMood(input: MoodModel): Observable<OutputPlaylistModel> {
    return this.http.post<OutputPlaylistModel>(this.apiUrl + 'mood', input);
  }

  getPlaylistForWeather(input: WeatherModel): Observable<OutputPlaylistModel> {
    return this.http.post<OutputPlaylistModel>(this.apiUrl + 'weather', input);
  }

  setLink(link) {
    this.link = link;
  }

  getLink() {
    return this.link;
  }
}
