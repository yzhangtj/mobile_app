// Used to smooth CO2 data for display screen
// choose largest for every Nth value where N=ratio
export const downSampleMax = (data, ratio) => {
  let result = [];
  let maxElement = { x: 0, y: 0 };
  let i;
  let j = 0;
  let k = 0;
  for (i = 0; i < data.length; i = i + ratio) {
    if (i < data.length) {
      maxElement = { x: 0, y: 0 };
      for (j = i; j < i + ratio; j++) {
        if (j < data.length && data[j].y > maxElement.y) {
          maxElement = data[j];
        }
      }
      result[k] = maxElement;
      k++;
    }
  }
  return result;
};
