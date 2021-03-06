import { Component, AfterViewInit } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { from } from 'rxjs';
import * as L from 'leaflet';
import { mapToMapExpression } from '@angular/compiler/src/render3/util';
import { TuneInService } from 'src/app/services/tunein.service';
import { CountryModel, MapModel } from 'src/app/models/tuneIn.model';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { element } from 'protractor';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarModule,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-map-background',
  templateUrl: './map-background.component.html',
  styleUrls: ['./map-background.component.scss'],
})
export class MapBackgroundComponent implements AfterViewInit {
  constructor(
    private tuneInService: TuneInService,
    private dom: DomSanitizer,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  // code for playlist
  link = 'https://open.spotify.com/embed/playlist/37i9dQZEVXbMDoHDwVN2tF';
  safeLink = this.dom.bypassSecurityTrustResourceUrl(this.link);
  showPlaylist: boolean = false;
  country: string;

  linkChanged(newLink) {
    this.link = 'https://open.spotify.com/embed/playlist/' + newLink;
    this.safeLink = this.dom.bypassSecurityTrustResourceUrl(this.link);
    this.showPlaylist = true;
  }

  showPlaylistChanged(newShow) {
    this.showPlaylist = newShow;
  }

  // code for map
  private map;
  private myMarker = {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      // specify the path here
      iconUrl: 'https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png',
    }),
  };
  input = {} as CountryModel;

  ngAfterViewInit(): void {
    this.initMap();
    this.input.country_name = 'Italy';
    this.tuneInService.getPlaylistForCountry(this.input).subscribe((res) => {});
  }

  //create map function
  private initMap(): void {
    var marker;
    this.map = L.map('map', {
      center: [44.7866, 44.7866],
      zoom: 2.5,
      minZoom: 2.5,
      maxZoom: 4,
      maxBoundsViscosity: 1.0,
    });
    //remove zoom control buttons from map
    this.map.zoomControl.remove();
    //set map bounds
    var southWest = L.latLng(-89.98155760646617, -180),
      northEast = L.latLng(89.99346179538875, 180);
    var bounds = L.latLngBounds(southWest, northEast);

    this.map.setMaxBounds(bounds);

    //set map tiles
    const tiles = L.tileLayer(
      'https://api.mapbox.com/styles/v1/vikivod/cki6jbjo39mkc19o5ks8pwrkn/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmlraXZvZCIsImEiOiJja2k2ajg5c3Izdm91MnJwNWN6ZnRucmlqIn0.O-hMgtuuRP_N5asmx6kScg',
      {
        maxZoom: 19,
        attribution:
          '© <a href="https://www.mapbox.com/map-feedback/%22%3EMapbox</a> © <a href="http://www.openstreetmap.org/copyright%22%3EOpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);

    this.map.on('click', (e) => {
      if (marker) {
        // check
        this.map.removeLayer(marker);
      }
      marker = L.marker([e.latlng.lat, e.latlng.lng], this.myMarker).addTo(
        this.map
      );

      this.http
        .get(
          'https://api.opencagedata.com/geocode/v1/json?q=' +
            e.latlng.lat.toFixed(4) +
            '%2C' +
            e.latlng.lng.toFixed(4) +
            '&key=2fa8364933cc4f829a1ddc387deec0c8&pretty=1'
        )
        .subscribe((res) => {
          console.log(res);
          let temp = [];
          Object.keys(res).map(function (key) {
            temp.push({ [key]: res[key] });
          });
          this.country = temp[3]['results'][0]['components']['country'];
          let model = {} as CountryModel;
          model.country_name = this.country;

          if (this.country) {
            this.tuneInService.getPlaylistForCountry(model).subscribe((res) => {
              if (res[0]) {
                this.linkChanged(res[0].link);
              } else {
                this.snackBar.open(
                  'Sorry, Spotify does not have any information about ' +
                    this.country +
                    '.',
                  'Close',
                  {
                    duration: 10000,
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                  }
                );
              }
            });
          } else {
            this.snackBar.open("Come on... don't click on water...", 'Close', {
              duration: 10000,
              horizontalPosition: 'right',
              verticalPosition: 'bottom',
            });
          }
        });
    });
  }
}
