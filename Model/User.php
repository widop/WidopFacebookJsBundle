<?php

namespace Widop\FacebookJsBundle\Model;

/**
 * User.
 *
 * @author GeLo <geloen.eric@gmail.com>
 */
class User implements UserInterface, \Serializable
{
    /**
     * @var string The facebook identifier.
     */
    protected $facebookId;

    /**
     * @var string The email.
     */
    protected $email;

    /**
     * @var string The first name.
     */
    protected $firstName;

    /**
     * @var string The last name.
     */
    protected $lastName;

    /**
     * @var string The gender.
     */
    protected $gender;

    /**
     * @var \DateTime The birthday.
     */
    protected $birthday;

    /**
     * {@inheritdoc}
     */
    public function getFacebookId()
    {
        return $this->facebookId;
    }

    /**
     * {@inheritdoc}
     */
    public function setFacebookId($facebookId)
    {
        $this->facebookId = $facebookId;

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * {@inheritdoc}
     */
    public function setEmail($email)
    {
        $this->email = $email;

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function getFirstName()
    {
        return $this->firstName;
    }

    /**
     * {@inheritdoc}
     */
    public function setFirstName($firstName)
    {
        $this->firstName = $firstName;

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function getLastName()
    {
        return $this->lastName;
    }

    /**
     * {@inheritdoc}
     */
    public function setLastName($lastName)
    {
        $this->lastName = $lastName;

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function getGender()
    {
        return $this->gender;
    }

    /**
     * {@inheritdoc}
     */
    public function setGender($gender)
    {
        $this->gender = $gender;

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function getBirthday()
    {
        return $this->birthday;
    }

    /**
     * {@inheritdoc}
     */
    public function setBirthday(\DateTime $birthday = null)
    {
        $this->birthday = $birthday;

        return $this;
    }

    /**
     * Serialize the facebook user.
     *
     * @return string
     */
    public function serialize()
    {
        return serialize(array(
            $this->facebookId,
            $this->email,
            $this->firstName,
            $this->lastName,
            $this->gender,
            $this->birthday,
        ));
    }

    /**
     * Unserialize the facebook user.
     *
     * @param string $serialized The serialized facebook user.
     */
    public function unserialize($serialized)
    {
        list(
            $this->facebookId,
            $this->email,
            $this->firstName,
            $this->lastName,
            $this->gender,
            $this->birthday,
        ) = unserialize($serialized);
    }
}
