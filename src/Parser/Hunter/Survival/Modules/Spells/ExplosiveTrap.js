import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Hurls a fire trap to the target location  that explodes when an enemy approaches, causing (420% of
 * Attack power) Fire damage and burning all enemies within 8 yards for (420% of Attack power)
 * additional Fire damage over 10 sec. Trap will exist for 1 min.
 */
class ExplosiveTrap extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  bonusDamage = 0;
  casts = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EXPLOSIVE_TRAP_CAST.id) {
      return;
    }
    this.casts++;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EXPLOSIVE_TRAP_DAMAGE.id) {
      return;
    }
    if (this.casts === 0) {
      this.casts++;
      this.spellUsable.beginCooldown(SPELLS.EXPLOSIVE_TRAP_CAST.id, this.owner.fight.start_time);
    }
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EXPLOSIVE_TRAP_DAMAGE.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.bonusDamage} />
        </div>
      </div>
    );
  }
}

export default ExplosiveTrap;
