import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import * as L from 'leaflet';

export interface CoordinateSelection {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './map-picker.component.html',
  styleUrl: './map-picker.component.scss'
})
export class MapPickerComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() latitude?: number | null;
  @Input() longitude?: number | null;
  @Input() height: string = '400px';
  @Input() zoom: number = 12;
  @Output() coordinateSelected = new EventEmitter<CoordinateSelection>();

  private map?: L.Map;
  private marker?: L.Marker;
  private defaultCenter: L.LatLngExpression = [41.6086, 21.7453]; // Center of North Macedonia

  ngOnInit(): void {
    this.fixLeafletIconPath();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update marker position when coordinates change externally
    if ((changes['latitude'] || changes['longitude']) && this.map) {
      this.updateMarkerPosition();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private fixLeafletIconPath(): void {
    const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
    const iconUrl = 'assets/leaflet/marker-icon.png';
    const shadowUrl = 'assets/leaflet/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private initMap(): void {
    // Determine initial center
    let center: L.LatLngExpression;
    if (this.latitude && this.longitude) {
      center = [this.latitude, this.longitude];
    } else {
      center = this.defaultCenter;
    }

    // Initialize map
    this.map = L.map('map-picker', {
      center: center,
      zoom: this.zoom
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add click handler
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e);
    });

    // Add initial marker if coordinates exist
    if (this.latitude && this.longitude) {
      this.addMarker(this.latitude, this.longitude);
    }
  }

  private onMapClick(e: L.LeafletMouseEvent): void {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Update or add marker
    this.addMarker(lat, lng);

    // Emit coordinates
    this.coordinateSelected.emit({
      latitude: lat,
      longitude: lng
    });
  }

  private addMarker(lat: number, lng: number): void {
    // Remove existing marker if any
    if (this.marker) {
      this.marker.remove();
    }

    // Create new marker
    this.marker = L.marker([lat, lng], {
      draggable: true
    }).addTo(this.map!);

    // Add popup
    this.marker.bindPopup(`
      <div class="coordinate-popup">
        <strong>Selected Location</strong><br>
        Latitude: ${lat.toFixed(6)}<br>
        Longitude: ${lng.toFixed(6)}
      </div>
    `).openPopup();

    // Handle marker drag
    this.marker.on('dragend', (event) => {
      const position = event.target.getLatLng();
      this.coordinateSelected.emit({
        latitude: position.lat,
        longitude: position.lng
      });

      // Update popup
      event.target.setPopupContent(`
        <div class="coordinate-popup">
          <strong>Selected Location</strong><br>
          Latitude: ${position.lat.toFixed(6)}<br>
          Longitude: ${position.lng.toFixed(6)}
        </div>
      `);
    });
  }

  private updateMarkerPosition(): void {
    if (this.latitude && this.longitude) {
      this.addMarker(this.latitude, this.longitude);
      this.map?.setView([this.latitude, this.longitude], this.zoom);
    } else if (this.marker) {
      // Remove marker if coordinates are cleared
      this.marker.remove();
      this.marker = undefined;
    }
  }

  // Public method to center map on current location (if browser supports geolocation)
  centerOnCurrentLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          this.map?.setView([lat, lng], 15);
          this.addMarker(lat, lng);

          this.coordinateSelected.emit({
            latitude: lat,
            longitude: lng
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }
}

