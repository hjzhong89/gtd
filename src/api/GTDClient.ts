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

export type GetCountryOptions = {
  countries?: Array<string>;
  minCasualties?: number;
}
export type GetCountryRecord = {
  totalCasualties: number,
  totalIncidents: number,
  incidents: Array<string>
}

export type GetIncidentsOptions = {
  country?: string;
  minCasualties?: number;
}

export default interface GTDClient {
  getCountries(opts: GetCountryOptions): Promise<Map<string, GetCountryRecord>>;
  getIncidents(opts: GetIncidentsOptions): Promise<any>;
}

export const GtdAPIClient: GTDClient = {
  async getCountries(opts: GetCountryOptions = {}): Promise<any> {
    const params = [];
    if (opts.countries) {
      params.push(`countries=${JSON.stringify(opts.countries)}`)
    }
    if (opts.minCasualties) {
      params.push(`minCasualties=${opts.minCasualties}`)
    }
    const query = params.length > 0 ? `?${params.join('&')}` : ''
    const url = encodeURI(`${uri}/country${query}`);
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
    if (opts.minCasualties) {
      params.push(`minCasualties=${opts.minCasualties}`)
    }

    const query = `${params.join('&')}`;
    const url = encodeURI(`${uri}/incident?${query}`);
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
