import React from 'react';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class ColossusSmashAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  colossusSmashes = 0;
  shatteredColossusOverlaps = 0;

  on_byPlayer_cast(event) {
    if(SPELLS.COLOSSUS_SMASH.id !== event.ability.guid) {
      return;
    }
    
    this.colossusSmashes += 1;
    // Ignore the cast if the player didn't have shattered defenses.
    if(!this.combatants.selected.hasBuff(SPELLS.SHATTERED_DEFENSES.id)) {
      return;
    }
    // If the player used colossus smash when shattered defenses was active increment the counter.
    this.shatteredColossusOverlaps += 1;

    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = 'This Colossus Smash was used while Shattered Defenses was active.';
  }

  get shatteredColossusOverlapThresholds() {
    return {
			actual: this.shatteredColossusOverlaps / this.colossusSmashes,
			isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
			style: 'percentage',
		};
  }

  suggestions(when) {
    when(this.shatteredColossusOverlapThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You should avoid using <SpellLink id={SPELLS.COLOSSUS_SMASH.id} icon/> before you have consumed <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} icon/> with <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon/>.</Wrapper>)
        .icon(SPELLS.COLOSSUS_SMASH.icon)
        .actual(`Shattered Defenses was already active for ${formatPercentage(actual)}% of Colossus Smashes.`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default ColossusSmashAnalyzer;
