const gtd: Incident[] = require('../assets/gtd_short');

export type Incident = {
  eventid: number;
  iyear: number;
  imonth: number;
  iday: number;
  country: number;
  country_txt: string;
  region: number;
  region_txt: string;
  city: string;
  latitude: number;
  longitude: number;
  nkill: number;
  nwound: number;
  [props: string]: any;
}

export type GetIncidentsOptions = {
  countryList?: string[];
}

export default interface GTDClient {
  getIncidents(options: GetIncidentsOptions): Promise<any>;
}

export const LocalGTDClient: GTDClient = {
  async getIncidents(options: GetIncidentsOptions): Promise<Incident[]> {
    return gtd;
  },
};
