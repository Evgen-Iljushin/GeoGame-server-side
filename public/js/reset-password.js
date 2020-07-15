
// utils

// const findAll = (selector, cb) => {
//   Array.from(document.querySelectorAll(selector))
//     .forEach(cb);
// };

const find = (selector, cb) => {
  const el = document.querySelector(selector);

  if (el && cb) {
    cb(el);
  }
};


// reset-password

find('form', form => form.addEventListener('submit', e => {
  e.preventDefault();

  find('#email', field => {
    const email = field.value;
    const data = {email};

    fetch('/admin/custom-api/usr/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {'Content-type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 400) {
        const [firstError] = data.details;
        alert(firstError.message);
        return;
      }

      alert('A new password has been sent to your email address');
      window.location.href = '/';
    })
    .catch(err => {
      alert('Something went wrong. Please, try later')
      console.error(err);
    });
  });
}));
