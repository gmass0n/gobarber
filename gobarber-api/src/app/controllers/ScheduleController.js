// SCHEDULE CONTROLLER

// IMPORTS
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index( req, res ) {
    const checkUserProvider = await User.findOne( {
      where: { id: req.userId, provider: true },
    } );

    // VERIFICANDO SE O USUÁRIO É UM PROVEDOR
    if ( !checkUserProvider ) {
      return res.status( 401 ).json( { error: 'User is not a provider.' } );
    }

    const { date } = req.query;
    const parsedDate = parseISO( date );

    const appointments = await Appointment.findAll( {
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [
            startOfDay( parsedDate ),
            endOfDay( parsedDate ),
          ],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [ 'name' ],
        },
      ],
      order: [ 'date' ],
    } );

    return res.json( appointments );
  }
}

// EXPORT
export default new ScheduleController();
