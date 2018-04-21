import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';
import Wrapper from 'common/Wrapper';

/**
 *
 * Beast Mastery: Kill Command causes an additional effect, based on your pet's Specialization.
 * Survival: Flanking Strike causes an additional effect, based on your pet's Specialization.
 *
 * Ferocity: The target also bleeds for (270% of Attack power) Physical damage over 6 sec.
 * Tenacity: Your pet also takes 30% reduced damage for 6 sec.
 * Cunning: The target's movement speed is also reduced by 50% for 4 sec.
 */

class AspectOfTheBeast extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ASPECT_OF_THE_BEAST_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ASPECT_OF_THE_BEAST_BESTIAL_FEROCITY.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  get aspectOfTheBeastDamageThreshold() {
    return {
      actual: this.damage,
      isLessThan: {
        minor: 3,
        average: 2,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.aspectOfTheBeastDamageThreshold).addSuggestion((suggest) => {
      return suggest(<Wrapper><SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} /> had no damage contribution, which indiciates you did not have your pet specced into Ferocity, which it should always be.</Wrapper>)
        .icon(SPELLS.ASPECT_OF_THE_BEAST_TALENT.icon)
        .actual(`Aspect of the Beast did no additional damage`)
        .recommended(`Speccing your pet into Ferocity is recommended`);
    });
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id}>
            Bestial Ferocity
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default AspectOfTheBeast;
