export interface DeckConfigurationItem {
  cutoutId: string;
  cutoutFixtureId: string;
  opentronsModuleSerialNumber?: string;
}

export interface DeckConfiguration {
  data: DeckConfigurationItem[];
}
