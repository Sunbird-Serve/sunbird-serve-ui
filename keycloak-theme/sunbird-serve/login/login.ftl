<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=true; section>
    <#if section = "header">
    <#elseif section = "form">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 0.75rem; font-weight: 600; color: #475569; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Project SERVE — Uttar Pradesh</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #0E7490;">Welcome Back</div>
            <div style="color: #475569; font-size: 0.85rem; margin-top: 4px;">Sign in to continue</div>
        </div>

        <#if realm.password>
            <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                <div class="form-group">
                    <label for="username" class="control-label">Email</label>
                    <input tabindex="1" id="username" class="form-control" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="off" placeholder="Enter your email" />
                </div>

                <div class="form-group">
                    <label for="password" class="control-label">Password</label>
                    <input tabindex="2" id="password" class="form-control" name="password" type="password" autocomplete="off" placeholder="Enter your password" />
                </div>

                <div id="kc-form-options">
                    <#if realm.resetPasswordAllowed>
                        <a tabindex="5" href="${url.loginResetCredentialsUrl}">Forgot password?</a>
                    </#if>
                </div>

                <div id="kc-form-buttons">
                    <input tabindex="4" class="btn-primary" name="login" id="kc-login" type="submit" value="Sign In" />
                </div>
            </form>
        </#if>

        <#if social?? && social.providers??>
            <div id="kc-social-providers">
                <div style="color: #475569; font-size: 0.8rem; margin-bottom: 12px; text-align: center;">Or</div>
                <#list social.providers as p>
                    <a href="${p.loginUrl}" id="zocial-${p.alias}" class="zocial ${p.providerId}">
                        ${p.displayName}
                    </a>
                </#list>
            </div>
        </#if>
    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div id="kc-registration">
                <span>Don't have an account? <a tabindex="6" href="${url.registrationUrl}">Sign Up</a></span>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>
