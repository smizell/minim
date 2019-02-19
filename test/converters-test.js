const { expect } = require('./spec-helper');
const minim = require('../src/minim').namespace();

describe('Minim Converters', function () {
  describe('convertToElement', function () {
    function elementCheck(name, val) {
      let returnedElement;

      context(`when given ${name}`, function () {
        before(function () {
          returnedElement = minim.toElement(val);
        });

        it(`returns ${name}`, function () {
          expect(returnedElement.element).to.equal(name);
        });
      });
    }

    elementCheck('null', null);
    elementCheck('string', 'foobar');
    elementCheck('number', 1);
    elementCheck('boolean', true);
    elementCheck('array', [1, 2, 3]);
    elementCheck('object', {
      foo: 'bar',
    });
  });

  describe('convertFromElement', function () {
    function elementCheck(name, el) {
      context(`when given ${name}`, function () {
        let returnedElement;

        before(function () {
          returnedElement = minim.fromRefract(el);
        });

        it(`returns ${name} element`, function () {
          expect(returnedElement.element).to.equal(name);
        });

        it('has the correct value', function () {
          expect(returnedElement.toValue()).to.equal(el.content);
        });
      });
    }

    elementCheck('null', {
      element: 'null',
      content: null,
    });

    elementCheck('string', {
      element: 'string',
      content: 'foo',
    });

    elementCheck('number', {
      element: 'number',
      content: 4,
    });

    elementCheck('boolean', {
      element: 'boolean',
      content: true,
    });

    context('when given array', function () {
      const el = {
        element: 'array',
        content: [
          {
            element: 'number',
            content: 1,
          }, {
            element: 'number',
            content: 2,
          },
        ],
      };
      let returnedElement;

      before(function () {
        returnedElement = minim.fromRefract(el);
      });

      it('returns array element', function () {
        expect(returnedElement.element).to.equal('array');
      });

      it('has the correct values', function () {
        expect(returnedElement.toValue()).to.deep.equal([1, 2]);
      });
    });

    context('when given object', function () {
      const el = {
        element: 'object',
        meta: {},
        attributes: {},
        content: [
          {
            element: 'member',
            content: {
              key: {
                element: 'string',
                meta: {},
                attributes: {},
                content: 'foo',
              },
              value: {
                element: 'string',
                meta: {},
                attributes: {},
                content: 'bar',
              },
            },
          },
          {
            element: 'member',
            meta: {},
            attributes: {},
            content: {
              key: {
                element: 'string',
                meta: {},
                attributes: {},
                content: 'z',
              },
              value: {
                element: 'number',
                meta: {},
                attributes: {},
                content: 2,
              },
            },
          },
        ],
      };
      let returnedElement;

      before(function () {
        returnedElement = minim.fromRefract(el);
      });

      it('returns object element', function () {
        expect(returnedElement.element).to.equal('object');
      });

      it('has the correct values', function () {
        expect(returnedElement.toValue()).to.deep.equal({
          foo: 'bar',
          z: 2,
        });
      });
    });
  });
});
