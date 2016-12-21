export default function saveNewStudy() {
    return (dispatch) => {
        return dispatch({
          type: 'SAVE_NEW_STUDY'
        });
    };
}
