var maps = {};
const krebstypen = ["alle Krebsarten","Magenkrebs","Darmkrebs","Bauchspeicheldrüsenkrebs","Lungenkrebs","Brustkrebs","Eierstockkrebs","Prostatakrebs","Leukämie"]

krebstypen.map(function(kt) {
    maps[kt.replace(/ /,'_')] = {
        title: `Wo Menschen häufig an ${kt!="alle Krebsarten"?kt:"Krebs"} sterben`,
        description: `Altersstandardisierte Mortalität auf 100.000 Einwohner für ${kt} im Jahr 2007-2015 nach Bezirken.<br/>
        <small>Dargestellt wird der Unterschied zur Bundesrate</small>.
        `,
        source: "Statistik Austria",

        data: "gesamt.csv",
        topojson: "bezirke2016_mitwienerbezirken_e-eu-rt-fusioniert.topojson",
        value: (d) => d[`${kt}:diff_rate`],
        search: false,
        scale: 'diverging',
        colorschemes: ['#84a07c', '#f0edf1', '#ba2b58'],
        categories: undefined,
        tooltip: function(d,p,pctfmt,numfmt,changepctfmt,changefmt) {
          return `<strong>${d.bezirkname}</strong><br/>
          Mortalität im Bezirk: ${numfmt(d[`${kt}:rate`])} / 100.000<br/>
          Mortalität bundesweit:  ${numfmt(d[`${kt}:rate_at`])} / 100.000<br/>
          Unterschied zur Bundesrate: ${changefmt(d[`${kt}:diff_rate`])}%
          `;
        },
    }
});

maps['example'] = {
    /* title, description and source are injected into the relevant elements */
    title: 'example',
    description: `example`,
    source: 'Statistik Austria',

    data: 'example.csv', // utf-8 encoded csv file with a gkz or gkz_neu column
    topojson: undefined, // topojson with a GKZ property

    value: (d) => d.value, // value function: used on every data file line to extract value, feed into scale

    search: true, // should there be a search field? search always searches a topojson feature's _name_ property, except …
    feature_name_override: undefined, // data file key to use to override feature.property.name (therefore changing the search term)

    // scale, colorschemes, categories, categories_display, order
    // check legend.js for usage variants
    scale: 'linear', // key for the scale to use, as defined in legends.js' export
    colorschemes: ['#f1f1f1', '#af3b6e'],
    categories: undefined,
    categories_display: undefined,
    order: undefined,

    // tooltip function
    // params: data (from csv), properties (from feature), pctfmt, numf,mt, changepctfmt, changefmt
    tooltip: function(d,p,pctfmt,numfmt) {
      return `${numfmt(d.value)}`;
    },

    post_draw_tooltip: undefined, // function to be called after tooltip was drawn
                                  // can be used to add a linechart to the tooltip (see tooltip_linechart/tooltip.js)
                                  // params: tooltip_elem, pymChild, e.popup._source.feature, numfmt
};

Object.keys(maps).map((x) => {maps[x].map=x});

export { maps };
