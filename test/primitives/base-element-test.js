var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();
var KeyValuePair = require('../../lib/key-value-pair');
var RefElement = require('../../lib/minim').RefElement;
var ArraySlice = require('../../lib/minim').ArraySlice;

describe('Element', function() {
  context('when initializing', function() {
    it('should initialize the correct meta data', function() {
      var element = new minim.Element({}, {
        id: 'foobar',
        classes: ['a', 'b'],
        title: 'Title',
        description: 'Description'
      });

      expect(element.meta.get('id').toValue()).to.equal('foobar');
      expect(element.meta.get('classes').toValue()).to.deep.equal(['a', 'b']);
      expect(element.meta.get('title').toValue()).to.equal('Title');
      expect(element.meta.get('description').toValue()).to.equal('Description');
    });

    it('should allow initialising with meta object', function() {
      var meta = new minim.elements.Object();
      meta.set('id', 'foobar');
      var element = new minim.Element(null, meta);

      expect(element.meta.get('id').toValue()).to.equal('foobar');
    });

    it('should allow initialising with attributes object', function() {
      var attributes = new minim.elements.Object();
      attributes.set('test', 'foobar');
      var element = new minim.Element(null, null, attributes);

      expect(element.attributes.get('test').toValue()).to.equal('foobar');
    });
  });

  describe('when initializing with value', function() {
    var el;

    it('should properly serialize falsey string', function() {
      el = new minim.Element('');
      expect(el.toValue()).to.equal('');
    });

    it('should properly serialize falsey number', function() {
      el = new minim.Element(0);
      expect(el.toValue()).to.equal(0);
    });

    it('should properly serialize falsey boolean', function() {
      el = new minim.Element(false);
      expect(el.toValue()).to.equal(false);
    });

    it('should set parent to null', function() {
      var element = new minim.Element('');
      expect(element.parent).to.be.null;
    });
  });

  describe('#meta', function() {
    var element;

    before(function() {
      element = new minim.Element();
      element.meta.set('title', 'test');
    });

    it('retains the correct values', function() {
      expect(element.meta.getValue('title')).to.equal('test');
    });

    it('allows setting new attributes', function() {
      element.meta = {'title': 'test2'};
      expect(element.meta.getValue('title')).to.equal('test2');
    });
  });

  describe('#attributes', function() {
    var element;

    before(function() {
      element = new minim.Element();
      element.attributes.set('foo', 'bar');
    });

    it('retains the correct values', function() {
      expect(element.attributes.getValue('foo')).to.equal('bar');
    });

    it('allows setting new attributes', function() {
      element.attributes = {'test': 'bar'};
      expect(element.attributes.getValue('test')).to.equal('bar');
    });
  });

  describe('#element', function() {
    context('when getting an element that has not been set', function() {
      var el;

      before(function() {
        el = new minim.Element();
      });

      it('returns base element', function() {
        expect(el.element).to.equal('element');
      });
    });

    context('when setting the element', function() {
      var el;

      before(function() {
        el = new minim.Element();
        el.element = 'foobar';
      });

      it('sets the element correctly', function() {
        expect(el.element).to.equal('foobar');
      });
    })
  });

  describe('#primitive', function() {
    it('returns undefined primitive', function() {
      const element = new minim.Element();
      expect(element.primitive()).to.be.undefined;
    });
  });

  describe('#equals', function() {
    var el;

    before(function() {
      el = new minim.Element({
        foo: 'bar'
      }, {
        id: 'foobar'
      });
    });

    it('returns true when they are equal', function() {
      expect(el.meta.get('id').equals('foobar')).to.be.true;
    });

    it('returns false when they are not equal', function() {
      expect(el.meta.get('id').equals('not-equal')).to.be.false;
    });

    it('does a deep equality check', function() {
      expect(el.equals({ foo: 'bar'})).to.be.true;
      expect(el.equals({ foo: 'baz'})).to.be.false;
    });
  });

  describe('convenience methods', function() {
    var meta = {
      id: 'foobar',
      classes: ['a'],
      title: 'A Title',
      description: 'A Description'
    };

    context('when the meta is already set', function() {
      var el = new minim.Element(null, _.clone(meta));

      _.forEach(_.keys(meta), function(key) {
        it('provides a convenience method for ' + key, function() {
          expect(el[key].toValue()).to.deep.equal(meta[key]);
        });
      });
    });

    context('when meta is set with getters and setters', function() {
      var el = new minim.Element(null);

      _.forEach(_.keys(meta), function(key) {
        el[key] = meta[key];

        it('works for getters and setters for ' + key, function() {
          expect(el[key].toValue()).to.deep.equal(meta[key]);
        });

        it('stores the correct data in meta for ' + key, function() {
          expect(el.meta.get(key).toValue()).to.deep.equal(meta[key])
        });
      });
    });
  });

  describe('removing meta properties', function() {
    var el = minim.fromRefract({
      element: 'string',
      meta: {
        id: {
          element: 'string',
          content: 'foobar',
        },
        classes: {
          element: 'array',
          content: [
            {
              element: 'string',
              content: 'a'
            }
          ],
        },
        title: {
          element: 'string',
          content: 'A Title',
        },
        description: {
          element: 'string',
          content: 'A Description',
        }
      }
    });

    it('should allow removing property', function () {
      el.meta.remove('title');
      expect(el.meta.keys()).to.deep.equal(['id', 'classes', 'description']);
    });
  });

  describe('removing attribute properties', function() {
    var el = minim.fromRefract({
      element: 'string',
      attributes: {
        href: {
          element: 'string',
          content: 'foobar',
        },
        relation: {
          element: 'string',
          content: 'create',
        }
      }
    });

    it('should allow removing property', function () {
      el.attributes.remove('href');
      expect(el.attributes.keys()).to.deep.equal(['relation']);
    });
  });

  describe('hyperlinking', function() {
    context('when converting from Refract with links', function() {
      var el;

      before(function() {
        el = minim.fromRefract({
          element: 'string',
          meta: {
            links: {
              element: 'array',
              content: [
                {
                  element: 'link',
                  attributes: {
                    relation: {
                      element: 'string',
                      content: 'foo',
                    },
                    href: {
                      element: 'string',
                      content: '/bar',
                    }
                  }
                }
              ]
            }
          },
          content: 'foobar'
        })
      });

      it('correctly loads the links', function() {
        var link = el.meta.get('links').first;
        expect(link.element).to.equal('link');
        expect(link.relation.toValue()).to.equal('foo');
        expect(link.href.toValue()).to.equal('/bar');
      });
    });

    describe('#links', function() {
      context('when `links` is empty', function() {
        var el;

        before(function() {
          // String with no links
          el = minim.fromRefract({
            element: 'string',
            content: 'foobar'
          });
        });

        it('returns an empty array', function() {
          expect(el.links).to.have.length(0);
          expect(el.links.toValue()).to.deep.equal([]);
        });
      });

      context('when there are existing `links`', function() {
        var el;

        context('refract', function() {
          before(function() {
            el = minim.fromRefract({
              element: 'string',
              meta: {
                links: {
                  element: 'array',
                  content: [
                    {
                      element: 'link',
                      attributes: {
                        relation: {
                          element: 'string',
                          content: 'foo',
                        },
                        href: {
                          element: 'string',
                          content: '/bar',
                        }
                      }
                    }
                  ]
                }
              },
              content: 'foobar'
            });
          });

          it('provides the links from meta', function() {
            var link = el.links.first;
            expect(el.links).to.have.length(1);
            expect(link.relation.toValue()).to.equal('foo');
            expect(link.href.toValue()).to.equal('/bar');
          });
        });
      });
    });

    it('allows setting links', function() {
      const element = new minim.Element();
      element.links = new minim.elements.Array([
        new minim.elements.Link('el')
      ]);

      expect(element.links).to.be.instanceof(minim.elements.Array);
      expect(element.links.length).to.equal(1);
    });
  });

  describe('#children', function() {
    const ArrayElement = minim.getElementClass('array');

    it('returns empty element slice when content is primitive', function() {
      const element = new minim.Element('value');
      const children = element.children;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(0);
    });

    it('returns a direct child', function() {
      const child = new minim.Element('value');
      const element = new minim.Element(child);
      const children = element.children;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(1);
      expect(children.get(0)).to.equal(child);
    });

    it('returns element slice of direct children', function() {
      const child1 = new minim.Element('value1');
      const child2 = new minim.Element('value2');

      const element = new minim.Element([child1, child2]);
      const children = element.children;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(2);
      expect(children.get(0)).to.equal(child1);
      expect(children.get(1)).to.equal(child2);
    });

    it('returns element slice of key pair item', function() {
      const key = new minim.Element('key');
      const element = new minim.Element(new KeyValuePair(key));

      const children = element.children;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(1);
      expect(children.get(0)).to.equal(key);
    });

    it('returns element slice of key value pair items', function() {
      const key = new minim.Element('key');
      const value = new minim.Element('value');
      const element = new minim.Element(new KeyValuePair(key, value));

      const children = element.children;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(2);
      expect(children.get(0)).to.equal(key);
      expect(children.get(1)).to.equal(value);
    });
  });

  describe('#recursiveChildren', function() {
    const ArrayElement = minim.getElementClass('array');

    it('returns empty element slice when content is primitive', function() {
      const element = new minim.Element('value');
      const children = element.recursiveChildren;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(0);
    });

    it('returns all direct recursive children', function() {
      const childchild = new minim.Element('value');
      const child = new minim.Element(childchild);
      const element = new minim.Element(child);
      const children = element.recursiveChildren;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(2);
      expect(children.get(0)).to.equal(child);
      expect(children.get(1)).to.equal(childchild);
    });
  });

  context('when querying', function() {
    it('returns empty slice when there are no matching elements', function() {
      const element = new minim.Element();
      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.isEmpty).to.be.true;
    });

    it('finds direct element', function() {
      const StringElement = minim.getElementClass('string');
      const element = new minim.Element(
        new StringElement('Hello World')
      );

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['Hello World']);
    });

    it('finds direct element inside array', function() {
      const ArrayElement = minim.getElementClass('array');
      const StringElement = minim.getElementClass('string');
      const NumberElement = minim.getElementClass('number');
      const element = new ArrayElement([
        new StringElement('One'),
        new NumberElement(2),
        new StringElement('Three'),
      ]);

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['One', 'Three']);
    });

    it('finds direct element inside object', function() {
      const ObjectElement = minim.getElementClass('object');
      const MemberElement = minim.getElementClass('member');
      const StringElement = minim.getElementClass('string');
      const NumberElement = minim.getElementClass('number');

      const element = new ObjectElement();
      element.push(new MemberElement(new StringElement('key1'), new NumberElement(1)));
      element.push(new MemberElement(new NumberElement(2), new StringElement('value2')));

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['key1', 'value2']);
    });

    it('finds non-direct element inside element', function() {
      const StringElement = minim.getElementClass('string');

      const element = new minim.Element(
        new minim.Element(
          new StringElement('Hello World')
        )
      );

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['Hello World']);
    });

    it('finds non-direct element inside array', function() {
      const StringElement = minim.getElementClass('string');
      const ArrayElement = minim.getElementClass('array');

      const element = new minim.Element(
        new ArrayElement([
          new StringElement('Hello World')
        ])
      );

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['Hello World']);
    });

    it('finds non-direct element inside object', function() {
      const ObjectElement = minim.getElementClass('object');
      const ArrayElement = minim.getElementClass('array');
      const MemberElement = minim.getElementClass('member');
      const StringElement = minim.getElementClass('string');
      const NumberElement = minim.getElementClass('number');

      const element = new ObjectElement();
      element.push(new MemberElement(
        new ArrayElement([new StringElement('key1')]),
        new NumberElement(1)
      ));
      element.push(new MemberElement(
        new NumberElement(2),
        new ArrayElement([new StringElement('value2')])
      ));

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['key1', 'value2']);
    });

    it('attaches parent tree to found objects', function () {
      const StringElement = minim.getElementClass('string');
      const ArrayElement = minim.getElementClass('array');

      const hello = new StringElement('Hello World')
      const array = new ArrayElement([hello]);
      const element = new ArrayElement([array]);
      array.id = 'Inner';
      element.id = 'Outter';

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['Hello World']);

      const helloElement = result.get(0);
      const parentIDs = helloElement.parents.map(function (item) {
        return item.id.toValue();
      });
      expect(parentIDs).to.deep.equal(['Inner', 'Outter']);
    });

    it('finds elements contained in given elements', function () {
      const StringElement = minim.getElementClass('string');
      const ArrayElement = minim.getElementClass('array');
      const ObjectElement = minim.getElementClass('object');
      const MemberElement = minim.getElementClass('member');

      const object = new ObjectElement();
      object.push(new MemberElement(
        new StringElement('Three'),
        new ArrayElement([
          new StringElement('Four')
        ])
      ));

      const element = new ArrayElement([
        new StringElement('One'),
        object
      ]);

      const result = element.findRecursive('member', 'array', 'string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['Four']);
    });
  });

  describe('#toValue', function () {
    it('returns raw value', function () {
      const element = new minim.Element(1);

      expect(element.toValue()).to.equal(1);
    });

    it('returns element value', function () {
      const element = new minim.Element(
        new minim.Element('Hello')
      );

      expect(element.toValue()).to.equal('Hello');
    });

    it('returns array of element value', function () {
      const element = new minim.Element([
        new minim.Element('Hello')
      ]);

      expect(element.toValue()).to.deep.equal(['Hello']);
    });

    it('returns KeyValuePair value', function () {
      const element = new minim.Element(
        new KeyValuePair(
          new minim.Element('name'),
          new minim.Element('doe')
        )
      );

      expect(element.toValue()).to.deep.equal({
        key: 'name',
        value: 'doe'
      });
    });
  });

  describe('#clone', function () {
    it('clones an element', function () {
      var element = new minim.Element('hello');
      var cloned = element.clone();

      expect(cloned.content).to.equal(element.content);
      expect(cloned).not.to.equal(element);
    });

    it('clones an element name', function () {
      var element = new minim.Element('hello');
      element.element = 'test';
      var cloned = element.clone();

      expect(cloned.element).to.equal('test');
    });

    it('clones an element with child element', function () {
      var child = new minim.Element('child');
      var element = new minim.Element(child);
      var cloned = element.clone();

      expect(cloned.content).not.to.equal(child);
      expect(cloned.content.content).to.equal('child');
    });

    it('clones an element with array of elements', function () {
      var child = new minim.Element('child');
      var element = new minim.Element([child]);
      var cloned = element.clone();

      expect(cloned.content[0]).not.to.equal(child);
      expect(cloned.content[0].content).to.equal('child');
    });

    it('clones an element with key value pair', function () {
      var child = new minim.Element('name');
      var element = new minim.elements.Member(child);
      var cloned = element.clone();

      expect(cloned.content.key).not.to.equal(child);
      expect(cloned.content.key.content).to.equal('name');
    });

    it('clones meta values', function () {
      var element = new minim.Element();
      element.title = 'Test';

      var cloned = element.clone();

      expect(cloned.title.toValue()).to.equal('Test');
    });

    it('clones attributes values', function () {
      var element = new minim.Element();
      element.attributes.set('name', 'Test');

      var cloned = element.clone();

      expect(cloned.attributes.get('name').toValue()).to.equal('Test');
    });
  });

  describe('#toRef', function () {
    it('can create ref element for an element', function () {
      var element = new minim.Element();
      element.id = 'example';

      var ref = element.toRef();

      expect(ref).to.be.instanceof(RefElement);
      expect(ref.path.toValue()).to.be.equal('element');
      expect(ref.content).to.equal('example');
    });

    it('can create a ref element with a path', function () {
      var element = new minim.Element();
      element.id = 'example';

      var ref = element.toRef('attributes');

      expect(ref).to.be.instanceof(RefElement);
      expect(ref.path.toValue()).to.be.equal('attributes');
      expect(ref.content).to.equal('example');
    });

    it('throws error when creating ref element from element without ID', function () {
      var element = new minim.Element();

      expect(function() { element.toRef(); }).to.throw();
    });
  });

  describe('#parent', function () {
    it('configures parent when setting element content to be an element', function () {
      var element = new minim.Element('parent');
      var child = new minim.Element('child');

      element.content = child;

      expect(child.parent).to.be.equal(element);
    });

    it('removes parent when unsetting element content from an element', function () {
      var element = new minim.Element('parent');
      var child = new minim.Element('child');

      element.content = child;
      element.content = null;

      expect(child.parent).to.be.null;
    });

    it('configures parent when setting element content to be array of element', function () {
      var element = new minim.Element('parent');
      var child = new minim.Element('child');

      element.content = [child];

      expect(child.parent).to.be.equal(element);
    });

    it('removes parent when unsetting element content from array containing an element', function () {
      var element = new minim.Element('parent');
      var child = new minim.Element('child');

      element.content = [child];
      element.content = null;

      expect(child.parent).to.be.null;
    });

    it('configures parent when setting element content to be key value pair', function () {
      var element = new minim.Element('parent');
      var key = new minim.Element('key');
      var value = new minim.Element('value');

      element.content = new KeyValuePair(key, value);

      expect(key.parent).to.be.equal(element);
      expect(value.parent).to.be.equal(element);
    });

    it('removes parent when unsetting element content from key value pair', function () {
      var element = new minim.Element('parent');
      var key = new minim.Element('key');
      var value = new minim.Element('value');

      element.content = new KeyValuePair(key, value);
      element.content = null;

      expect(key.parent).to.be.null;
      expect(value.parent).to.be.null;
    });

    it('errors when setting parent for element that has a previous parent', function () {
      var child = new minim.Element('child');
      var parent = new minim.Element(child);

      expect(function () { child.parent = new minim.Element(); }).to.throw();
    });

    it('sets parent for elements pushed onto a content array', function () {
      var child1 = new minim.Element('one');
      var child2 = new minim.Element('two');
      var child3 = new minim.Element('three');
      var array = new minim.Element([child1]);

      var result = array.content.push(child2, child3);

      expect(result).to.equal(3);
      expect(array.content).to.deep.equal([child1, child2, child3]);

      expect(child1.parent).to.be.equal(array);
      expect(child2.parent).to.be.equal(array);
    });

    it('sets parent for elements unshifted onto a content array', function () {
      var child1 = new minim.Element('one');
      var child2 = new minim.Element('two');
      var child3 = new minim.Element('three');
      var array = new minim.Element([child1]);

      var result = array.content.unshift(child2, child3);

      expect(result).to.equal(3);
      expect(array.content).to.deep.equal([child2, child3, child1]);

      expect(child1.parent).to.be.equal(array);
      expect(child2.parent).to.be.equal(array);
    });

    it('removes parent for elements popped from a content array', function () {
      var child = new minim.Element();
      var array = new minim.Element([child]);

      array.content.pop();

      expect(child.parent).to.be.null;
    });

    it('removes parent for elements shifted from a content array', function () {
      var child = new minim.Element();
      var array = new minim.Element([child]);

      array.content.shift();

      expect(child.parent).to.be.null;
    });

    it('removes parent for elements spliced from a content array', function () {
      var child1 = new minim.Element('one');
      var child2 = new minim.Element('two');
      var child3 = new minim.Element('three');
      var array = new minim.Element([child1, child2, child3]);

      var result = array.content.splice(1, 1);

      expect(result).to.deep.equal([child2]);
      expect(child2.parent).to.be.null;
    });

    it('adds parent for elements spliced into a content array', function () {
      var child1 = new minim.Element('one');
      var child2 = new minim.Element('two');
      var child3 = new minim.Element('three');
      var child4 = new minim.Element('four');
      var array = new minim.Element([child1, child2, child3]);

      var result = array.content.splice(1, 1, child4);

      expect(result).to.deep.equal([child2]);
      expect(array.content).to.deep.equal([child1, child4, child3]);
      expect(child4.parent).to.be.equal(array);
    });
  });

  describe('#parents', function () {
    it('configures parent when setting element content to be an element', function () {
      var one = new minim.Element('bottom');
      var two = new minim.Element(one);
      var three = new minim.Element(two);

      expect(one.parents).to.be.instanceof(ArraySlice);
      expect(one.parents.elements).to.deep.equal([two, three]);
    });
  });
});
