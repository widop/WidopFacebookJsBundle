<?php

namespace Widop\FacebookJsBundle\Model;

/**
 * User interface.
 *
 * @author GeLo <geloen.eric@gmail.com>
 */
interface UserInterface
{
    /**
     * Gets the facebook identifier.
     *
     * @return string
     */
    function getFacebookId();

    /**
     * Sets the facebook identifier.
     *
     * @param string $facebookId The facebook identifier.
     *
     * @return \Widop\FacebookJsBundle\Entity\UserInterface
     */
    function setFacebookId($facebookId);

    /**
     * Gets the email.
     *
     * @return string
     */
    function getEmail();

    /**
     * Sets the email.
     *
     * @param string $email The email.
     *
     * @return \Widop\FacebookJsBundle\Entity\UserInterface
     */
    function setEmail($email);

    /**
     * Gets the first name.
     *
     * @return string
     */
    function getFirstName();

    /**
     * Sets the first name.
     *
     * @param string $firstName The first name.
     *
     * @return \Widop\FacebookJsBundle\Entity\UserInterface
     */
    function setFirstName($firstName);

    /**
     * Gets the last name.
     *
     * @return string
     */
    function getLastName();

    /**
     * Sets the last name.
     *
     * @param string $lastName The last name.
     *
     * @return \Widop\FacebookJsBundle\Entity\UserInterface
     */
    function setLastName($lastName);

    /**
     * Gets the gender.
     *
     * @return string
     */
    function getGender();

    /**
     * Sets the gender.
     */
    function setGender($gender);

    /**
     * Gets the birthday.
     *
     * @return \DateTime
     */
    function getBirthday();

    /**
     * Sets the birthday.
     *
     * @param \DateTime $birthday The birthday.
     *
     * @return \Widop\FacebookJsBundle\Entity\UserInterface
     */
    function setBirthday(\DateTime $birthday = null);
}
