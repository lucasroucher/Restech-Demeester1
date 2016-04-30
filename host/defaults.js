module.exports = {
    dataDir: "C:\\Restech\\DataView\\data",
    img: 'img/192x49.gif',
    name: 'Name',
    address: 'Address',
    city: 'City',
    state: 'State',
    zip: 'Zip',
    phone: 'tel: (xxx) xxx-xxxx fax: (xxx) xxx-xxxx',
    acidNormals75: {
        upright: [ 0.0842, 0.0065, 0.0, 0.0 ],
        supine:  [ 0.607, 0.228, 0.0507, 0.0 ]
    },
    acidNormals: {
        upright:   [ 0.329, 0.0629, 0.0013, 0.00021 ],
        supine:    [ 0.779, 0.551, 0.239, 0.0515 ]
    },
    colors: {
        normal:    '#bff5bf',
        mild:      '#f5f598',
        moderate:  '#e0e055',
        severe:    '#edacab',
        meal:      '#0000ff',
        supine:    '#19d1d1',
        cough:     '#55f505',
        heartburn: '#000000',
        symptom1:  '#ff0000',
        symptom2:  '#002e00',
        symptom3:  '#9b30ff'
    },
    minEventTime: 10,
    endEventThreshold: 0.1
};
