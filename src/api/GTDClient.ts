const uri = 'http://localhost:3000/api';
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
  lastId?: string;
  country?: string;
  count?: number;
}

export default interface GTDClient {
  getCasualties(): Promise<any>;
  getIncidents(options: GetIncidentsOptions): Promise<any>;
}

export const GtdAPIClient: GTDClient = {
  async getCasualties(): Promise<any> {
    const url = `${uri}/casualties`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    return response.json();
  },
  async getIncidents(opts: GetIncidentsOptions = {}): Promise<Incident[]> {
    const params = [];
    if (opts.country) {
      params.push(`country=${opts.country}`);
    }

    if (opts.count) {
      params.push(`count=${opts.count}`);
    }

    if (opts.lastId) {
      params.push(`lastId=${opts.lastId}`);
    }

    const query = `${params.join('&')}`;
    const url = `${uri}/incidents?${query}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    return response.json();
  },
};
