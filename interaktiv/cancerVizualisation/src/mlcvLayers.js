import breast from './layers/breast';
import bladder from './layers/bladder';
import Enums from './enums.js';
import esophagus from './layers/esophagus';
import figure from './layers/figure';
import intestine from './layers/intestine';
import liver from './layers/liver';
import lungs from './layers/lungs';
import pancreas from './layers/pancreas';
import prostate from './layers/prostate';
import testicle from './layers/testicle';
import thyroid from './layers/thyroid';
import uterus from './layers/uterus';

export default {
    default: figure,

    cancers: {
        [Enums.Cancers.PANCREAS]: pancreas,
        [Enums.Cancers.BREASTCANCER]: breast,
        [Enums.Cancers.INTESTINE]: intestine,
        [Enums.Cancers.UTERUS]: uterus,
        [Enums.Cancers.BLADDER]: bladder,
        [Enums.Cancers.TESTICLE]: testicle,
        [Enums.Cancers.LIVER]: liver,
        [Enums.Cancers.LUNGS]: lungs,
        [Enums.Cancers.PROSTATE]: prostate,
        [Enums.Cancers.THYROID]: thyroid,
        [Enums.Cancers.ESOPHAGUS]: esophagus
    }
};
