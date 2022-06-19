
// Used to smooth CO2 data for display screen
// choose every Nth value where N=ratio
export const downSample = (data, ratio) => {
  let result = [];
  let i;
  let k = 0;
  for (i = 0; i < data.length; i = i + ratio) {
    if (i < data.length) {
      result[k] = data[i];
      k++;
    }
  }
  return result;
};
