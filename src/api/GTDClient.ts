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

export type GetOptions = {
  country?: Array<string>;
  year?: Array<number>,
  minCasualties?: number;
}
export type GetCountryRecord = {
  totalCasualties: number,
  totalIncidents: number,
  incidents: Array<string>
}

export default interface GTDClient {
  getCountries(opts: GetOptions): Promise<Map<string, GetCountryRecord>>;

  getIncidents(opts: GetOptions): Promise<any>;
}

const getQueryString = (opts: GetOptions) => {
  const params = [];
  if (opts.country) {
    params.push(`country=${opts.country}`)
  }
  if (opts.year) {
    params.push(`year=${opts.year}`)
  }
  if (opts.minCasualties) {
    params.push(`minCasualties=${opts.minCasualties}`)
  }
  return params.length > 0 ? `?${params.join('&')}` : '';
};

export const GtdAPIClient: GTDClient = {
  async getCountries(opts: GetOptions = {}): Promise<any> {
    const query = getQueryString(opts);
    const url = `${uri}/country${query}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    return response.json();
  },
  async getIncidents(opts: GetOptions = {}): Promise<Incident[]> {
    const query = getQueryString(opts);
    const url = encodeURI(`${uri}/incident${query}`);
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
