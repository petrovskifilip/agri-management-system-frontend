import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface ParcelMapMarker {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  area?: number;
  cropName?: string;
}

@Component({
  selector: 'app-parcel-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parcel-map.component.html',
  styleUrl: './parcel-map.component.scss'
})
export class ParcelMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() markers: ParcelMapMarker[] = [];
  @Input() center?: { lat: number; lng: number };
  @Input() zoom: number = 13;
  @Input() height: string = '400px';

  private map?: L.Map;
  private markerLayer?: L.LayerGroup;

  ngOnInit(): void {
    // Fix for default marker icon issue with webpack
    this.fixLeafletIconPath();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private fixLeafletIconPath(): void {
    // Fix for Leaflet default icon paths
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
    // Determine center point
    let mapCenter: L.LatLngExpression;

    if (this.center) {
      mapCenter = [this.center.lat, this.center.lng];
    } else if (this.markers.length > 0) {
      mapCenter = [this.markers[0].latitude, this.markers[0].longitude];
    } else {
      // Default to a world view
      mapCenter = [0, 0];
    }

    // Initialize map
    this.map = L.map('parcel-map', {
      center: mapCenter,
      zoom: this.zoom
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Create marker layer
    this.markerLayer = L.layerGroup().addTo(this.map);

    // Add markers
    this.addMarkers();

    // Fit bounds if multiple markers
    if (this.markers.length > 1) {
      this.fitBoundsToMarkers();
    }
  }

  private addMarkers(): void {
    if (!this.markerLayer) return;

    this.markers.forEach(marker => {
      if (marker.latitude && marker.longitude) {
        const leafletMarker = L.marker([marker.latitude, marker.longitude]);

        // Create popup content
        const popupContent = this.createPopupContent(marker);
        leafletMarker.bindPopup(popupContent);

        leafletMarker.addTo(this.markerLayer!);
      }
    });
  }

  private createPopupContent(marker: ParcelMapMarker): string {
    let content = `<div class="map-popup">
      <h3>${marker.name}</h3>
      <p><strong>Coordinates:</strong><br>
      Lat: ${marker.latitude.toFixed(6)}, Lng: ${marker.longitude.toFixed(6)}</p>`;

    if (marker.area) {
      content += `<p><strong>Area:</strong> ${marker.area} m²</p>`;
    }

    if (marker.cropName) {
      content += `<p><strong>Crop:</strong> ${marker.cropName}</p>`;
    }

    content += `</div>`;
    return content;
  }

  private fitBoundsToMarkers(): void {
    if (!this.map || this.markers.length === 0) return;

    const bounds = L.latLngBounds(
      this.markers.map(m => L.latLng(m.latitude, m.longitude))
    );

    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  // Public method to update markers dynamically
  updateMarkers(markers: ParcelMapMarker[]): void {
    this.markers = markers;

    if (this.markerLayer) {
      this.markerLayer.clearLayers();
      this.addMarkers();

      if (this.markers.length > 1) {
        this.fitBoundsToMarkers();
      } else if (this.markers.length === 1) {
        this.map?.setView(
          [this.markers[0].latitude, this.markers[0].longitude],
          this.zoom
        );
      }
    }
  }
}

