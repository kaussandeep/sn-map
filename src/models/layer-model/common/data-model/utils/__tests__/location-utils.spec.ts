/**
 * @jest-environment jsdom
 */

import LocationUtils from '../location-utils';

describe('LocationUtils', () => {
  describe('getLocationKind', () => {
    it('should return LATLONGS when isLatLong is true', () => {
      const location = '';
      const kind = LocationUtils.getLocationKind(location, true);
      expect(kind).toEqual('LATLONGS');
    });

    it('should return STRINGCOORDS when bracketed location', () => {
      const location = '[foobar]';
      const kind = LocationUtils.getLocationKind(location, false);
      expect(kind).toEqual('STRINGCOORDS');
    });

    it('should return NAMES when string location', () => {
      const location = 'foobar';
      const kind = LocationUtils.getLocationKind(location, false);
      expect(kind).toEqual('NAMES');
    });

    it('should return NAMES when number location', () => {
      const location = 1;
      const kind = LocationUtils.getLocationKind(location, false);
      expect(kind).toEqual('NAMES');
    });

    it('should return UNKOWN when invalid location', () => {
      const location = '-';
      const kind = LocationUtils.getLocationKind(location, false);
      expect(kind).toEqual('UNKOWN');
    });
  });

  describe('addLocationSuffix', () => {
    let meta: LocationMeta;
    let data: LocationData;

    beforeEach(() => {
      meta = {
        expressions: [],
        isLatLong: false,
        isAuto: false,
        locationType: '',
      };
      data = {
        locationOrLatitude: '',
        locationCountry: '',
        locationAdmin1: '',
        locationAdmin2: '',
      };
    });

    it('should return locationOrLatitude when auto', () => {
      meta.isAuto = true;
      data.locationOrLatitude = 'foobar';
      const location = LocationUtils.addLocationSuffix(data, meta);
      expect(location).toEqual('foobar');
    });

    it('should add location names', () => {
      data.locationOrLatitude = 'foobar';
      data.locationCountry = 'country';
      data.locationAdmin1 = 'admin1';
      data.locationAdmin2 = 'admin2';
      const location = LocationUtils.addLocationSuffix(data, meta);
      expect(location).toEqual('foobar,country,admin1,admin2');
    });

    it('should only add locationCountry', () => {
      data.locationOrLatitude = 'foobar';
      data.locationCountry = 'country';
      data.locationAdmin1 = undefined;
      const location = LocationUtils.addLocationSuffix(data, meta);
      expect(location).toEqual('foobar,country');
    });

    it('should only add locationCountry and locationAdmin1', () => {
      data.locationOrLatitude = 'foobar';
      data.locationCountry = 'country';
      data.locationAdmin1 = 'admin1';
      const location = LocationUtils.addLocationSuffix(data, meta);
      expect(location).toEqual('foobar,country,admin1');
    });

    it('should add locationType', () => {
      meta.locationType = 'Country';
      data.locationOrLatitude = 'foobar';
      const location = LocationUtils.addLocationSuffix(data, meta);
      expect(location).toEqual('foobar:Country');
    });
  });

  describe('parseGeometryString', () => {
    it('should return null if undefined', () => {
      const geometryString = LocationUtils.parseGeometryString(undefined);
      expect(geometryString).toBeNull();
    });

    it('should parse geometry strings correctly', () => {
      let geometryString = LocationUtils.parseGeometryString('[3.1415926,2.7182818]');
      expect(geometryString).toEqual([2.7182818, 3.1415926]);

      geometryString = LocationUtils.parseGeometryString('[[8,9],[10,2],[13,1],[0,0]]');
      expect(geometryString).toEqual([
        [9, 8],
        [2, 10],
        [1, 13],
        [0, 0],
      ]);

      geometryString = LocationUtils.parseGeometryString(
        '[[[6.285,46.236],[6.122,46.155],[6,46.151]],[[8.721,47.693],[8.681,47.714]]]'
      );
      expect(geometryString).toEqual([
        [
          [46.236, 6.285],
          [46.155, 6.122],
          [46.151, 6],
        ],
        [
          [47.693, 8.721],
          [47.714, 8.681],
        ],
      ]);

      geometryString = LocationUtils.parseGeometryString(
        '[[[[9.258,41.339],[9.248,41.346],[9.248,41.348],[9.261,41.342],[9.258,41.339]]],[[[9.266,41.369],[9.262,41.368],[9.253,41.374],[9.268,41.377],[9.266,41.369]]],[[[9.098,41.397],[9.125,41.447],[9.069,41.45]]]]'
      );
      expect(geometryString).toEqual([
        [
          [41.339, 9.258],
          [41.346, 9.248],
          [41.348, 9.248],
          [41.342, 9.261],
          [41.339, 9.258],
        ],
        [
          [41.369, 9.266],
          [41.368, 9.262],
          [41.374, 9.253],
          [41.377, 9.268],
          [41.369, 9.266],
        ],
        [
          [41.397, 9.098],
          [41.447, 9.125],
          [41.45, 9.069],
        ],
      ]);
    });
  });

  describe('switchCoordinatesAndCountDepth', () => {
    it('should switch coordinates and return depth', () => {
      const check = (arr: any[], expected: any[], expectedDepth: number) => {
        const depth = LocationUtils.switchCoordinatesAndCountDepth(arr);
        expect(arr).toEqual(expected);
        expect(depth).toEqual(expectedDepth);
      };

      check([1, 2], [2, 1], 0);
      check(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [2, 1],
          [4, 3],
        ],
        1
      );
      check(
        [
          [
            [1, 2],
            [3, 4],
          ],
          [[5, 6]],
        ],
        [
          [
            [2, 1],
            [4, 3],
          ],
          [[6, 5]],
        ],
        2
      );
    });
  });
});
