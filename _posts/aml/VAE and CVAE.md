---
title: VAE and CVAE
category: Machine learining
katex: true
published: false
hide: true
---
### Basics of VAE
$$
\log p^*\left(x^{(i)}\right) \geq-D_{K L}\left[p_E\left(z \mid x^{(i)}\right) \| p(z)\right]+\mathbb{E}_{z \sim p_E\left(z \mid x^{(i)}\right)}\left[\log p_D\left(x^{(i)} \mid z\right)\right]=-\mathcal{L}\left(D, E, x^{(i)}\right)
$$
where $x^{(i)} \in \mathbb{R}^D$ is the  i-th training instance.  The LHS is the logarithm of the true data distribution, and the RHS is termed the "evicence lower bound" (ELBO).
call $𝑝_𝐸$(𝑧∣𝑥) the encoder and  $𝑝_𝐷(𝑥∣𝑧)$ the decoder. Both will be represented by neural networks.Goal is to approximate $p^{(x)}$ as well as possible by maximizing the ELBO or equivalently minimizing its negation.
Specifically, minimize  $\mathcal{L}(𝐷,𝐸,𝑥(𝑖))$ with respect to the parameters of the decoder network D and the encoder network E via gradient descent over all training instances i.

In order to estimate the negative ELBO,approximate the expectation w.r.t. z by its average over L instances:
$$
\hat{\mathcal{L}}\left(D, E, x^{(i)}\right)=D_{K L}\left[p_E\left(z \mid x^{(i)}\right) \| p(z)\right]+\frac{1}{L} \sum_{l=1}^L\left(-\log p_D\left(x^{(i)} \mid z^{(i, l)}\right)\right)
$$

where $z^{(i, l)} \sim p_E\left(z \mid x^{(i)}\right)$. By construction of a VAE, $p_E\left(z \mid x^{(i)}\right)$ is a Gaussian distribution whose mean $\mu^{(i)}=\mu_E\left(x^{(i)}\right)$ and standard deviation $\sigma^{(i)}=\sigma_E\left(x^{(i)}\right)$ are computed by the encoder network. For fixed $x^{(i)}$, draw samples $z^{(i, l)}$ from this code distribution by means of the reparametrization trick:
$$
z^{(i, l)} \sim \mathcal{N}\left(\mu^{(i)}, \operatorname{diag}\left(\sigma^{(i)}\right)^2\right) \Leftrightarrow z^{(i, l)}=\mu^{(i)}+\epsilon_l \cdot \sigma^{(i)}
$$
with $\epsilon_l \sim \mathcal{N}\left(0\right.$,$\mathbb{I}$). Note that $\mu^{(i)}, \sigma^{(i)}$, and $\epsilon_l$ are vectors of length equal to the dimension $J$ of the latent space, and $\epsilon_l \cdot \sigma^{(i)}$ is element-wise multiplication. In practice, $L=1$ is usually sufficient so that the average over index $l$ becomes trivial.

Furthermore, assume that the latent prior is a standard normal distribution, i.e. $p(z) = \mathcal{N}(0, \mathbb{I})$. The KL-term for the two multivariate normal distributions can then be computed analytically:
$$ D_{KL}\left[p_E(z \mid x^{(i)}) \| p(z)\right] = \frac{1}{2} \sum_{j=1}^J \left((\mu_j^{(i)})^2 + (\sigma_j^{(i)})^2 - 2 \log(\sigma_j^{(i)}) - 1\right) $$

Likewise, consider $p_D(x \mid z)$ as a Gaussian distribution with mean $\mu_D(z)$ and fixed covariance matrix $\sigma_G^2\cdot \mathbb{I}$ (i.e. $\sigma_G$ is the fixed noise standard deviation):
$$ p_G(x \mid z) = \mathcal{N}\big(\mu_D(z), \sigma_G^2\cdot\mathbb{I}\big)$$
To ensure that $\mu_D(z) \in [0,1]^D$ holds for reconstructed images (without noise), the decoder's output layer should use the sigmoid activation function. The second term in the negated ELBO (the negative log-likelihood) now reduces to the squared loss:
$$-\log p_D(x^{(i)} \mid z^{(i,l)}) = \frac{||x^{(i)} - \mu_D(z^{(i,l)})||^2_2}{2 \sigma_G^2}  + \text{const.}$$
The additive constant has no influence on the training optimimum and can be dropped. $\sigma_G$ can be used as a hyperparameter to balance the two loss terms.

For a batch of samples $X = (x^{(1)}, \dots, x^{(M)})$, we finally get the negated ELBO as:
\begin{align} -ELBO = \sum_{i=1}^M \Big[&\frac{1}{2} \sum_{j=1}^J \left((\mu_j^{(i)})^2 + (\sigma_j^{(i)})^2 - 2 \log(\sigma_j^{(i)}) - 1\right) + \frac{1}{L} \sum_{l=1}^L \sum_{j=1}^D \frac{(x^{(i)}_j - \mu_D(z^{(i,l)})_j)^2}{2\sigma_G^2}\Big]\end{align}
Training is performed by gradient descent on this loss.
### Implementation of VAE and CVAE
The CVAE class consists of three parts
* The Encoder class that implements $p_E (z \mid x, y)$,
* The Decoder class which implements $p_D (x \mid z, y)$ and
* The actual CVAE class that combines both encoder and decoder.
The conditioning variable $y$ holds the labels, e.g. 0...9 for MNIST digits. It is added as an additional network input, i.e. the encoder computes $\mu_E(x^{(i)}, y^{(i)})$ and $\sigma_E(x^{(i)}, y^{(i)})$. The decoder produces the reconstruction `recon_x`=$\mu_D(z^{(i)}, y^{(i)})$, where $z^{(i)}$ is sampled using the reparametrization trick explained above. 
``` python
class CVAE(nn.Module):

    def __init__(self, inp_dim, encoder_layer_sizes, decoder_layer_sizes, latent_dim, num_labels=10, conditional=False):
        """
        Arguments:
            inp_dim (int): dimension of input,
            encoder_layer_sizes (list[int]): list of the sizes of the encoder layers,
            decoder_layer_sizes (list[int]): list of the sizes of the decoder layers,
            latent_dim (int): dimension of latent space/bottleneck,
            num_labels (int): amount of labels (important for conditional VAE),,
            conditional (bool): True if CVAE, else False

        """
        
        super(CVAE, self).__init__()
        
        self.latent_dim = latent_dim
        self.num_labels = num_labels
        
        self.encoder = Encoder(encoder_layer_sizes, latent_dim, num_labels, conditional)
        self.decoder = Decoder(decoder_layer_sizes, latent_dim, num_labels, conditional)
        
    def forward(self, x, c=None):
        """
        Forward Process of whole VAE/CVAE. 
        Arguments:
            x: tensor of dimension (batch_size, 1, 28, 28) or (batch_size, 28*28)
            c: None or tensor of dimension (batch_size, 1)
        Output: recon_x, means, log_var
            recon_x: see explanation on second part of estimator above,
            means: output of encoder,
            log_var: output of encoder (logarithm of variance)
        """
        batch_size = x.size(0)
        x = x.view(-1,784)
        means,log_var=self.encoder(x,c)
        #normal distributed epsilon
        eps=torch.randn(means.shape,device=device)
        #reparametrization trick
        z=means+torch.mul(eps,torch.exp(log_var/2))
        recon_x=self.decoder(z,c)
        return recon_x, means, log_var
        
    def sampling(self, n=2, c=None):
        """
        Arguments:
            n (int): amount of samples (amount of elements in the latent space)
            c (bool): condition
        Output:
            x_sampled: n randomly sampled elements of the output distribution
        """
        #sample with mu=0 and var=1
        z=torch.randn(n,device=device)
        x_sampled=self.decoder(z,c)
        return x_sampled 
    
class Encoder(nn.Module):

    def __init__(self, layer_sizes, latent_dim, num_labels, conditional=False):
        super(Encoder, self).__init__()
        """
        Arguments:
            layer_sizes (list[int]): list of sizes of layers of the encoder,
            latent_dim (int): dimension of latent space, i.e. dimension out output of the encoder,
            num_labels (int): amount of labels,
            conditional (bool): True if CVAE and False if VAE
        """
        self.conditional=conditional
        self.num_labels=num_labels
        modules=[]
        for i in range(len(layer_sizes)-1):
            modules.append(nn.Linear(layer_sizes[i]+(num_labels if i==0 and conditional else 0),layer_sizes[i+1]))
            modules.append(nn.ReLU())
        self.mlp=nn.Sequential(*modules)
        self.linear_mu=nn.Linear(layer_sizes[-1],latent_dim)
        self.linear_lvar=nn.Linear(layer_sizes[-1],latent_dim)

    def forward(self, x, c=None):  
        """
        Arguments:
            x: tensor of dimension (batch_size, 1, 28, 28) or (batch_size, 28*28)
            c: None or tensor of dimension (batch_size, 1)
        Output:
            means: tensor of dimension (batch_size, latent_dim),
            log_var: tensor of dimension (batch_size, latent_dim)
        """
        x=x.view(-1,784)
        if self.conditional:
            if len(c.shape)==1:
                c=idx2onehot(c,self.num_labels)
            #concatenate data and condition
            x=torch.cat([x,c.view(-1,self.num_labels)],dim=1)
        x=self.mlp(x)
        means=self.linear_mu(x)
        log_vars=self.linear_lvar(x)    
        return means, log_vars
    
    
class Decoder(nn.Module):

    def __init__(self, layer_sizes, latent_dim, num_labels, conditional=False):     
        super(Decoder, self).__init__()
        """
        Arguments:
            layer_sizes (list[int]): list of sizes of layers of the decoder,
            latent_dim (int): dimension of latent space, i.e. dimension out input of the decoder,
            num_labels (int): amount of labels,
            conditional (bool): True if CVAE and False if VAE
        Output:
            x: Parameters of gaussian distribution; only mu (see above)
        """

        self.conditional=conditional
        self.latent_dim=latent_dim
        self.num_labels=num_labels
        modules=[]
        #if conditional:
        #    layer_sizes[-1]+=1
        #effective layersizes start at latent dimension
        eff_layer_sizes=[latent_dim +(num_labels if conditional else 0),*layer_sizes]
        for i in range(len(eff_layer_sizes)-1):
            modules.append(nn.Linear(eff_layer_sizes[i],eff_layer_sizes[i+1]))
            if i!=len(eff_layer_sizes)-2:
                modules.append(nn.ReLU())
        modules.append(nn.Sigmoid())
        self.mlp=nn.Sequential(*modules)
 
    def forward(self, z, c=None):
        """
        Argumetns:
            z: tensor of dimension (batch_size, latent_dim)
            c: None or tensor of dimension (batch_size, 1)
        Outputs:
            x: mu of gaussian distribution (reconstructed image from latent code z)
        """
        if self.conditional:
            if len(c.shape)==1:
                c=idx2onehot(c,self.num_labels)
            #concatenate latent representation and condition
            z=torch.cat([z.view(-1,self.latent_dim),c.view(-1,self.num_labels)],dim=1)
        x=self.mlp(z)
        return x 
```
### Loss
Minimize the negated ELBO loss:
$$\hat{\mathcal{L}}(D, E, x^{(i)}) = D_{KL}\left[p_E(z \mid x^{(i)}) \| p(z)\right]+ \frac{1}{L} \sum_{l=1}^L \left(-\log p_D(x^{(i)} \mid z^{(i,l)})\right)$$
where $L=1$. The `loss_function` should implement this estimator, expanding the two terms as explained above.
``` python
def loss_function(recon_x, x, mu, log_var):
    """
    Arguments:
        recon_x: reconstruced input
        x: input,
        mu, log_var: parameters of posterior (distribution of z given x)
    """ 
    recon_x=recon_x.view(-1,784)
    x=x.view(-1,784)
    kl_divergence=.5*torch.sum(mu*mu+log_var.exp()-log_var-1)
    reconstruction_loss=F.binary_cross_entropy(recon_x,x,reduction='sum')
    return kl_divergence+reconstruction_loss
```
### VAE
#### train
``` python
encoder_layer_sizes = [784, 512, 256]
decoder_layer_sizes = [256, 512, 784]

latent_dim = 2 
vae = CVAE(inp_dim=784, encoder_layer_sizes=encoder_layer_sizes, decoder_layer_sizes=decoder_layer_sizes, latent_dim=latent_dim)
vae = vae.to(device)
optimizer = optim.Adam(vae.parameters(), lr=1e-3)

# Train
def train(epoch):
    vae.train()
    train_loss = 0
    for batch_idx, data in enumerate(train_loader):
        x, y = data
        x = x.to(device)
        optimizer.zero_grad()
        
        recon_batch,  mu, log_var = vae(x)
        loss = loss_function(recon_batch,  x, mu, log_var)
        
        loss.backward()
        train_loss += loss.item()
        optimizer.step()
        
        if batch_idx % 100 == 99:
            print('Train Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}'.format(
                epoch+1, batch_idx * train_loader.batch_size, len(train_loader.dataset),
                100. * batch_idx / len(train_loader), loss.item() / len(data)))
    print('====> Epoch: {} Average loss: {:.4f}'.format(epoch+1, train_loss / len(train_loader.dataset)))
    
epochs = 15 
for epoch in range(epochs):
    train(epoch)   
```
```
Train Epoch: 1 [12672/60000 (21%)]	Loss: 12698.556641
Train Epoch: 1 [25472/60000 (42%)]	Loss: 10969.422852
Train Epoch: 1 [38272/60000 (64%)]	Loss: 10916.695312
Train Epoch: 1 [51072/60000 (85%)]	Loss: 11205.342773
====> Epoch: 1 Average loss: 186.8475
Train Epoch: 2 [12672/60000 (21%)]	Loss: 11003.737305
Train Epoch: 2 [25472/60000 (42%)]	Loss: 10214.543945
Train Epoch: 2 [38272/60000 (64%)]	Loss: 10418.898438
Train Epoch: 2 [51072/60000 (85%)]	Loss: 10818.951172
====> Epoch: 2 Average loss: 163.1774
Train Epoch: 3 [12672/60000 (21%)]	Loss: 10510.250977
Train Epoch: 3 [25472/60000 (42%)]	Loss: 9763.567383
Train Epoch: 3 [38272/60000 (64%)]	Loss: 10022.850586
Train Epoch: 3 [51072/60000 (85%)]	Loss: 10441.345703
====> Epoch: 3 Average loss: 156.9741
Train Epoch: 4 [12672/60000 (21%)]	Loss: 10275.211914
Train Epoch: 4 [25472/60000 (42%)]	Loss: 9475.633789
Train Epoch: 4 [38272/60000 (64%)]	Loss: 9807.998047
Train Epoch: 4 [51072/60000 (85%)]	Loss: 10169.058594
====> Epoch: 4 Average loss: 153.2925
Train Epoch: 5 [12672/60000 (21%)]	Loss: 10091.563477
Train Epoch: 5 [25472/60000 (42%)]	Loss: 9244.532227
Train Epoch: 5 [38272/60000 (64%)]	Loss: 9612.284180
Train Epoch: 5 [51072/60000 (85%)]	Loss: 9992.487305
====> Epoch: 5 Average loss: 150.5578
Train Epoch: 6 [12672/60000 (21%)]	Loss: 10049.949219
Train Epoch: 6 [25472/60000 (42%)]	Loss: 9305.797852
Train Epoch: 6 [38272/60000 (64%)]	Loss: 9670.478516
Train Epoch: 6 [51072/60000 (85%)]	Loss: 9944.232422
====> Epoch: 6 Average loss: 148.7862
Train Epoch: 7 [12672/60000 (21%)]	Loss: 9890.549805
Train Epoch: 7 [25472/60000 (42%)]	Loss: 9070.938477
Train Epoch: 7 [38272/60000 (64%)]	Loss: 9435.882812
Train Epoch: 7 [51072/60000 (85%)]	Loss: 9702.543945
====> Epoch: 7 Average loss: 147.1604
Train Epoch: 8 [12672/60000 (21%)]	Loss: 9895.227539
Train Epoch: 8 [25472/60000 (42%)]	Loss: 9117.156250
Train Epoch: 8 [38272/60000 (64%)]	Loss: 9419.084961
Train Epoch: 8 [51072/60000 (85%)]	Loss: 9538.291992
====> Epoch: 8 Average loss: 145.9311
Train Epoch: 9 [12672/60000 (21%)]	Loss: 9837.948242
Train Epoch: 9 [25472/60000 (42%)]	Loss: 8969.166016
Train Epoch: 9 [38272/60000 (64%)]	Loss: 9324.500977
Train Epoch: 9 [51072/60000 (85%)]	Loss: 9546.360352
====> Epoch: 9 Average loss: 144.9094
Train Epoch: 10 [12672/60000 (21%)]	Loss: 9715.806641
Train Epoch: 10 [25472/60000 (42%)]	Loss: 8913.258789
Train Epoch: 10 [38272/60000 (64%)]	Loss: 9305.085938
Train Epoch: 10 [51072/60000 (85%)]	Loss: 9565.345703
====> Epoch: 10 Average loss: 144.3162
Train Epoch: 11 [12672/60000 (21%)]	Loss: 9688.914062
Train Epoch: 11 [25472/60000 (42%)]	Loss: 8937.277344
Train Epoch: 11 [38272/60000 (64%)]	Loss: 9299.335938
Train Epoch: 11 [51072/60000 (85%)]	Loss: 9453.343750
====> Epoch: 11 Average loss: 143.6801
Train Epoch: 12 [12672/60000 (21%)]	Loss: 9669.410156
Train Epoch: 12 [25472/60000 (42%)]	Loss: 8931.222656
Train Epoch: 12 [38272/60000 (64%)]	Loss: 9242.147461
Train Epoch: 12 [51072/60000 (85%)]	Loss: 9535.370117
====> Epoch: 12 Average loss: 142.9494
Train Epoch: 13 [12672/60000 (21%)]	Loss: 9635.882812
Train Epoch: 13 [25472/60000 (42%)]	Loss: 8938.017578
Train Epoch: 13 [38272/60000 (64%)]	Loss: 9273.310547
Train Epoch: 13 [51072/60000 (85%)]	Loss: 9325.531250
====> Epoch: 13 Average loss: 142.2734
Train Epoch: 14 [12672/60000 (21%)]	Loss: 9610.380859
Train Epoch: 14 [25472/60000 (42%)]	Loss: 8785.593750
Train Epoch: 14 [38272/60000 (64%)]	Loss: 9196.544922
Train Epoch: 14 [51072/60000 (85%)]	Loss: 9323.528320
====> Epoch: 14 Average loss: 142.0139
Train Epoch: 15 [12672/60000 (21%)]	Loss: 9596.013672
Train Epoch: 15 [25472/60000 (42%)]	Loss: 8955.174805
Train Epoch: 15 [38272/60000 (64%)]	Loss: 9241.420898
Train Epoch: 15 [51072/60000 (85%)]	Loss: 9236.555664
====> Epoch: 15 Average loss: 141.5106
```
#### Sanity Check VAE
``` python
def imshow(img):
    npimg = img.cpu().numpy()
    plt.imshow(npimg, vmin=0, vmax=1, cmap='gray')
    plt.xticks([])
    plt.yticks([])
    
_, x= next(enumerate(train_loader))
samples = x[0].to(device)[30:]
samples_rec,   _, _ = vae(samples)
samples_rec = samples_rec.detach().cpu().view(-1,28,28)
print("Original             Reconstructed")
for i in range(0, 4):
  plt.subplot(4,2,2*i+1)
  imshow(samples[i,0])
    
  plt.subplot(4, 2, 2*i+2)
  imshow(samples_rec[i])
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/vae/output_14_1.png)

``` python
for i in range(1, 10):
    plt.subplot(3,3,i)
    sample = vae.sampling(n=2).detach().view(-1,28,28).cpu()
    plt.tight_layout()
    imshow(sample[0])
    plt.xticks([])
    plt.yticks([])
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/vae/output_17_0.png)

### CVAE
#### train
``` python
encoder_layer_sizes = [784, 512, 256]
decoder_layer_sizes = [256, 512, 784]
latent_dim = 2
cvae = CVAE(inp_dim=784, encoder_layer_sizes=encoder_layer_sizes, decoder_layer_sizes=decoder_layer_sizes, latent_dim=latent_dim, conditional=True )

cvae = cvae.to(device)
optimizer = optim.Adam(cvae.parameters())


def train(epoch):
    cvae.train()
    train_loss = 0
    for batch_idx, data in enumerate(train_loader):
        x, y = data
        x = x.to(device)
        optimizer.zero_grad()
        recon_batch, mu, log_var = cvae(x, y)
        loss = loss_function(recon_batch, x, mu, log_var)
        
        loss.backward()
        train_loss += loss.item()
        optimizer.step()
        
        if batch_idx % 100 == 0:
            print('Train Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}'.format(
                epoch, batch_idx * len(x), len(train_loader.dataset),
                100. * batch_idx / len(train_loader), loss.item() / len(data)))
    print('====> Epoch: {} Average loss: {:.4f}'.format(epoch, train_loss / len(train_loader.dataset)))
    
    
for epoch in range(1, 15):
    train(epoch)
```
```
Train Epoch: 1 [0/60000 (0%)]	Loss: 34773.046875
Train Epoch: 1 [12800/60000 (21%)]	Loss: 11345.059570
Train Epoch: 1 [25600/60000 (43%)]	Loss: 10418.718750
Train Epoch: 1 [38400/60000 (64%)]	Loss: 9440.360352
Train Epoch: 1 [51200/60000 (85%)]	Loss: 9513.434570
====> Epoch: 1 Average loss: 172.2384
Train Epoch: 2 [0/60000 (0%)]	Loss: 9134.568359
Train Epoch: 2 [12800/60000 (21%)]	Loss: 9132.405273
Train Epoch: 2 [25600/60000 (43%)]	Loss: 9275.717773
Train Epoch: 2 [38400/60000 (64%)]	Loss: 8832.240234
Train Epoch: 2 [51200/60000 (85%)]	Loss: 8962.715820
====> Epoch: 2 Average loss: 142.1997
Train Epoch: 3 [0/60000 (0%)]	Loss: 8648.283203
Train Epoch: 3 [12800/60000 (21%)]	Loss: 8744.358398
Train Epoch: 3 [25600/60000 (43%)]	Loss: 8969.887695
Train Epoch: 3 [38400/60000 (64%)]	Loss: 8611.957031
Train Epoch: 3 [51200/60000 (85%)]	Loss: 8828.741211
====> Epoch: 3 Average loss: 137.7247
Train Epoch: 4 [0/60000 (0%)]	Loss: 8336.078125
Train Epoch: 4 [12800/60000 (21%)]	Loss: 8541.374023
Train Epoch: 4 [25600/60000 (43%)]	Loss: 8808.566406
Train Epoch: 4 [38400/60000 (64%)]	Loss: 8486.429688
Train Epoch: 4 [51200/60000 (85%)]	Loss: 8695.232422
====> Epoch: 4 Average loss: 135.5109
Train Epoch: 5 [0/60000 (0%)]	Loss: 8200.635742
Train Epoch: 5 [12800/60000 (21%)]	Loss: 8415.031250
Train Epoch: 5 [25600/60000 (43%)]	Loss: 8726.733398
Train Epoch: 5 [38400/60000 (64%)]	Loss: 8384.304688
Train Epoch: 5 [51200/60000 (85%)]	Loss: 8622.375977
====> Epoch: 5 Average loss: 134.0055
Train Epoch: 6 [0/60000 (0%)]	Loss: 8178.321289
Train Epoch: 6 [12800/60000 (21%)]	Loss: 8369.407227
Train Epoch: 6 [25600/60000 (43%)]	Loss: 8686.392578
Train Epoch: 6 [38400/60000 (64%)]	Loss: 8311.339844
Train Epoch: 6 [51200/60000 (85%)]	Loss: 8521.525391
====> Epoch: 6 Average loss: 132.9650
Train Epoch: 7 [0/60000 (0%)]	Loss: 8167.270508
Train Epoch: 7 [12800/60000 (21%)]	Loss: 8326.064453
Train Epoch: 7 [25600/60000 (43%)]	Loss: 8640.548828
Train Epoch: 7 [38400/60000 (64%)]	Loss: 8242.840820
Train Epoch: 7 [51200/60000 (85%)]	Loss: 8455.881836
====> Epoch: 7 Average loss: 132.1670
Train Epoch: 8 [0/60000 (0%)]	Loss: 8081.956055
Train Epoch: 8 [12800/60000 (21%)]	Loss: 8293.097656
Train Epoch: 8 [25600/60000 (43%)]	Loss: 8592.372070
Train Epoch: 8 [38400/60000 (64%)]	Loss: 8209.428711
Train Epoch: 8 [51200/60000 (85%)]	Loss: 8404.958008
====> Epoch: 8 Average loss: 131.6514
Train Epoch: 9 [0/60000 (0%)]	Loss: 8077.868164
Train Epoch: 9 [12800/60000 (21%)]	Loss: 8271.739258
Train Epoch: 9 [25600/60000 (43%)]	Loss: 8582.044922
Train Epoch: 9 [38400/60000 (64%)]	Loss: 8157.152832
Train Epoch: 9 [51200/60000 (85%)]	Loss: 8361.163086
====> Epoch: 9 Average loss: 131.1329
Train Epoch: 10 [0/60000 (0%)]	Loss: 7977.985352
Train Epoch: 10 [12800/60000 (21%)]	Loss: 8257.039062
Train Epoch: 10 [25600/60000 (43%)]	Loss: 8526.751953
Train Epoch: 10 [38400/60000 (64%)]	Loss: 8124.020020
Train Epoch: 10 [51200/60000 (85%)]	Loss: 8339.078125
====> Epoch: 10 Average loss: 130.6374
Train Epoch: 11 [0/60000 (0%)]	Loss: 7956.093262
Train Epoch: 11 [12800/60000 (21%)]	Loss: 8252.970703
Train Epoch: 11 [25600/60000 (43%)]	Loss: 8535.597656
Train Epoch: 11 [38400/60000 (64%)]	Loss: 8092.844238
Train Epoch: 11 [51200/60000 (85%)]	Loss: 8276.328125
====> Epoch: 11 Average loss: 130.3098
Train Epoch: 12 [0/60000 (0%)]	Loss: 7928.493652
Train Epoch: 12 [12800/60000 (21%)]	Loss: 8252.811523
Train Epoch: 12 [25600/60000 (43%)]	Loss: 8543.328125
Train Epoch: 12 [38400/60000 (64%)]	Loss: 8045.717773
Train Epoch: 12 [51200/60000 (85%)]	Loss: 8300.215820
====> Epoch: 12 Average loss: 130.0170
Train Epoch: 13 [0/60000 (0%)]	Loss: 7936.500488
Train Epoch: 13 [12800/60000 (21%)]	Loss: 8250.230469
Train Epoch: 13 [25600/60000 (43%)]	Loss: 8501.939453
Train Epoch: 13 [38400/60000 (64%)]	Loss: 8029.661621
Train Epoch: 13 [51200/60000 (85%)]	Loss: 8227.021484
====> Epoch: 13 Average loss: 129.6619
Train Epoch: 14 [0/60000 (0%)]	Loss: 7895.163574
Train Epoch: 14 [12800/60000 (21%)]	Loss: 8224.188477
Train Epoch: 14 [25600/60000 (43%)]	Loss: 8482.400391
Train Epoch: 14 [38400/60000 (64%)]	Loss: 8034.394531
Train Epoch: 14 [51200/60000 (85%)]	Loss: 8223.781250
====> Epoch: 14 Average loss: 129.4107
```
#### Sanity Check CVAE
``` python
x,l = next(iter(train_loader))
plt.figure(figsize=(8,8))
for i in range(0, 10):
    x_one_label = x[l==i][:2]

    samples = x_one_label[:1].to(device)
    labels= i* torch.ones(1).long().to(device)
    plt.subplot(5,4,2*i+1)
    #plt.tight_layout()
    imshow(samples[0,0].cpu())
    plt.title("Ori. {}".format(i))
    
    samples_rec, _, _ = cvae(samples, c = labels)
    samples_rec = samples_rec.detach().cpu().view(-1,28,28)

    plt.subplot(5, 4, 2*i+2)
    #plt.tight_layout()
    imshow(samples_rec[0])
    plt.title("Rec. {}".format(i))
```



### Visualisation of Latent Space of VAE
#### Visualisation of output of decoder
``` python
N=15
x_gr,y_gr=np.linspace(-3,3,N),np.linspace(-3,3,N)
X,Y=np.meshgrid(x_gr,y_gr)
grid=np.vstack(tuple(map(np.ravel, np.meshgrid(x_gr,y_gr)))).T

latent_coord=torch.from_numpy(grid).float().to(device)
decoder_output=vae.decoder(latent_coord).detach().cpu().numpy()

fig = plt.figure(figsize=(10,10))
ax = []
for i in range(N*N):
    img = decoder_output[i].reshape(28,28)
    # create subplot and append to ax
    ax.append( fig.add_subplot(N, N, i+1) )
    ax[-1].set_aspect('equal')
    plt.axis('off')
    plt.imshow(img,cmap='gray')
plt.subplots_adjust(wspace=-.05, hspace=-.05)
plt.show()
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/vae/output_32_0.png)




#### Visualisation of latent space
``` python
whole_set_loader=torch.utils.data.DataLoader(dataset=train_dataset, batch_size=10000, shuffle=True,num_workers=1)
x_data,y_data=next(iter(whole_set_loader))
x_data = x_data.float().to(device)
y_data = y_data.numpy()
latent_rep=vae.encoder(x_data)[0].detach().cpu().numpy()

plt.figure(figsize=(8,6))
for i in range(10):
    plt.scatter(*latent_rep[y_data==i].T,label=i,s=3,alpha=.5)
plt.legend()
plt.title('latent space visualization')
plt.xlabel('first latent dimension')
plt.ylabel('second latent dimension')
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/vae/output_34_1.png)

###  Visualisation of Latent Space of CVAE
#### Visualisation of Latent Space from Decoder
``` python
def visual_cvae(label,borders=(-3,3,-3,3),N=15):
    xmin,xmax,ymin,ymax=borders
    x_gr,y_gr=np.linspace(xmin,xmax,N),np.linspace(ymin,ymax,N)
    X,Y=np.meshgrid(x_gr,y_gr)
    grid=np.vstack(tuple(map(np.ravel, np.meshgrid(x_gr,y_gr)))).T
    labels=label*torch.ones(len(grid)).long().to(device)
    latent_coord=torch.from_numpy(grid).float().to(device)
    decoder_output=cvae.decoder(latent_coord,labels).detach().cpu().numpy()
    fig = plt.figure(figsize=(10,10))
    ax = []
    for i in range(N*N):
        img = decoder_output[i].reshape(28,28)
        # create subplot and append to ax
        ax.append( fig.add_subplot(N, N, i+1) )
        ax[-1].set_aspect('equal')
        plt.axis('off')
        plt.imshow(img,cmap='gray')
    plt.subplots_adjust(wspace=-.05, hspace=-.05)
    plt.show() 
visual_cvae(4)
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/vae/output_43_0.png)



``` python
whole_set_loader=torch.utils.data.DataLoader(dataset=train_dataset, batch_size=6000, shuffle=True,num_workers=1)
x_data,y_data=next(iter(whole_set_loader))
x_data = x_data.float().to(device)
y_data = y_data.numpy()
plt.figure(figsize=(8,6))
for i in range(10):
    plt.scatter(*cvae.encoder(x_data,i*torch.ones(whole_set_loader.batch_size).long().to(device))[0].detach().cpu().numpy().T,label=i,s=3,alpha=.5)
plt.legend()
plt.title('latent space visualization')
plt.xlabel('first latent dimension')
plt.ylabel('second latent dimension')
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/vae/output_47_1.png)
#### Generative Classifier
Define our classifier as maximum a posteriori estimator and expand according to Bayes rule. The label $\hat y$ for a given $x$ is predicted according to:
$$ \hat y= \arg \max_y p(y \mid x) = \arg \max_y \frac{p(x \mid y)p(y)}{p(x)} = \arg \max_y \log p(x \mid y) \ ,$$
where the last identity makes use of the fact that $p(y)=1/10$ is constant for all MNIST labels. Approximate $\log p(x \mid y)$ in the following way: Given an input image, run the CVAE 10 times, each time conditioning one of the different class labels $y$. Calculate the losses for each case and use them to design a classifier. Note that the network was never trained as classifier, but is still able to perform the task.
``` python
def reconstrucion_loss(recon_x,x):
    return F.binary_cross_entropy(recon_x[0].view(-1,784),x.view(-1,784),reduction='sum')
    
def classify(x):
    x=x.to(device)
    rec_losses=np.zeros(10)
    for i in range(10):
        rec_losses[i]=reconstrucion_loss(cvae(x,i*torch.ones(len(x)).long().to(device)),x)
    return np.argmin(rec_losses)
test_classification = torch.utils.data.DataLoader(dataset=test_dataset, batch_size=1, shuffle=False,num_workers=4)
corrects=[]
for i, data in enumerate(test_classification):
    if i%300==299:
        print(i)
    x,y=data
    corrects.append(classify(x)==y.long())
print('test accuracy: %.2f'%(100*np.count_nonzero(corrects)/len(corrects)),'%')
```
```
test accuracy: 93.04 %
```