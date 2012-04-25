<?php

namespace Widop\FacebookJsBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * Security controller.
 *
 * @author GeLo <geloen.eric@gmail.com>
 */
class SecurityController extends Controller
{
    /**
     * Index action.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function exposeAuthenticatedAction($_format)
    {
        $user = $this->get('security.context')->getToken()->getUser();

        if ($user !== 'anon.') {
            $authenticated = true;
        } else {
            $authenticated = false;
        }

        return $this->render('WidopFacebookJsBundle:Security:exposeAuthenticated.' . $_format . '.twig', array(
            'authenticated' => $authenticated
        ));
    }
}
