import axios from 'axios';
import { showAlert } from './alert';

export const UpdateUser = async (data, type) => {
     try {
          const url =
               type === 'password'
                    ? 'http://localhost:3000/api/v1/users/updatepassword'
                    : 'http://localhost:3000/api/v1/users/updateme';

          const res = await axios({
               method: 'PATCH',
               url,
               data,
          });
          // if (res.data.status === 'success') {
          //      showAlert('success', 'Updated');
          // }
     } catch (err) {
          showAlert('error', 'Error Data Is Not Updated');
     }
};
