import { IError } from '../utils/IError';
import {TFunction} from "i18next";

interface NominatimPlace {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox: [string, string, string, string];
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
    address: Record<string, string>;
}

/**
 * @class OpenStreetMapService
 * @description Service for interacting with OpenStreetMap Nominatim API.
 * Provides methods for searching locations by query string or structured address.
 *
 * @property {string} BASE_URL - Base URL for Nominatim search endpoint
 *
 * @method search Performs a free-text location search
 * @method searchAddress Performs a structured address search
 */
export class OpenStreetMapService {
    /**
     * @property BASE_URL
     * @description Base endpoint for OpenStreetMap Nominatim API
     * @private
     */
    private static BASE_URL = 'https://nominatim.openstreetmap.org/search';

    /**
     * @method search
     * @description Performs a location search using a free-text query
     *
     * @param {string} search - Search query (e.g., address, place name)
     * @param {TFunction} t - Express request
     *
     * @returns {Promise<NominatimPlace | null>} First matching result or null if none found
     *
     * @throws {IError} If request fails
     */
    static async search(search: string, t: TFunction) {
        const url
            = `${this.BASE_URL}?`
            + new URLSearchParams({
                q: search,
                format: 'json',
                addressdetails: '1',
                limit: '1'
            });

        const response = await fetch(url, {
            headers: {
                // REQUIRED by Nominatim policy
                'User-Agent': 'restaurant-app/1.0 (dev@app.com)'
            }
        });

        if (!response.ok) {
            throw new IError(400,  t('errors.notFound', { search }));
        }

        const data = (await response.json()) as NominatimPlace[];

        if (!data.length) {
            return null
        }

        return data[0]
    }

    /**
     * @method searchAddress
     * @description Performs a structured address lookup using individual address fields
     *
     * @param {Pick<Address, 'country' | 'street' | 'building' | 'postcode' | 'city'>} address
     * @param {TFunction} t - Express request
     *
     * @returns {Promise<NominatimPlace | null>} First matching result or null if none found
     *
     * @throws {IError} If request fails
     */
    static async searchAddress(address: { country: string, street: string, building: string, postcode: string, city: string }, t: TFunction) {
        const params = new URLSearchParams({
            format: 'json',
            addressdetails: '1',
            limit: '1',
            street: `${address.building} ${address.street}`,
            city: address.city,
            postalcode: address.postcode,
            country: address.country
        });

        const url = `${this.BASE_URL}?${params.toString()}`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'restaurant-app/1.0 (dev@app.com)' } // REQUIRED by Nominatim
        });

        if (!response.ok) {
            throw new IError(400, t('Could not find address'))
        }

        const data = (await response.json()) as NominatimPlace[];

        if (!data.length) {
            return null
        }

        return data[0]
    }
}