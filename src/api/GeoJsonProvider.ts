import { FeatureCollection, Feature } from 'geojson';

export const countryList = require('../assets/gtd_country_list');
export const worldCountries: FeatureCollection = require('../assets/world_countries');

export type GetFeaturesOptions = {
  countries?: number[];
};

/**
 * Gets all countries from the world_countries JSON file, unless the countries option is passed.
 * @param options
 */
export const getFeatures = (options: GetFeaturesOptions): Feature[] => {
  if (Array.isArray(options.countries) && options.countries.length > 0) {
    console.log(options.countries);
    return options.countries?.map((i) => worldCountries.features[i]);
  }
  return worldCountries.features;
};

export default {
  getFeatures,
};
